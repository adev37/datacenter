// apps/web/src/pages/appointments/AppointmentScheduling.jsx
import React, { useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/Button";

// components already in your repo
import AppointmentFilters from "./components/AppointmentFilters";
import AppointmentList from "./components/AppointmentList";
import CalendarView from "./components/CalendarView";
import QuickStats from "./components/QuickStats";

// RTK Query
import {
  useGetScheduleQuery,
  useListAppointmentsQuery,
  useCreateAppointmentMutation,
  useSetAppointmentStatusMutation,
  useUpdateAppointmentMutation,
  useUpsertTemplateMutation,
  useCreateBlockMutation,
} from "@/services/appointments.api";

// small helpers
const iso = (d) => new Date(d).toISOString().slice(0, 10);
const startOfWeek = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
};
const endOfWeek = (d) => {
  const x = startOfWeek(d);
  x.setDate(x.getDate() + 6);
  return x;
};

export default function AppointmentScheduling() {
  // UI state
  const [mode, setMode] = useState("calendar"); // 'calendar' | 'list'
  const [selectedDoctorId, setSelectedDoctorId] = useState(""); // hook to your doctor picker
  const [weekCursor, setWeekCursor] = useState(new Date()); // calendar window
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editing, setEditing] = useState(null);

  // left-panel filters (keep your component-controlled object)
  const [filters, setFilters] = useState({
    dateFrom: iso(new Date()),
    dateTo: iso(new Date()),
    department: "all",
    doctor: "all",
    appointmentType: "all",
    status: "all",
    searchTerm: "",
  });

  // ---- Build query params --------------------------------------------------
  const schedFrom = iso(startOfWeek(weekCursor));
  const schedTo = iso(endOfWeek(weekCursor));

  const scheduleParams =
    selectedDoctorId && schedFrom && schedTo
      ? { doctorId: selectedDoctorId, from: schedFrom, to: schedTo }
      : null;

  const listParams = useMemo(() => {
    const p = {};
    if (filters.dateFrom) p.dateFrom = filters.dateFrom;
    if (filters.dateTo) p.dateTo = filters.dateTo;
    if (filters.status && filters.status !== "all") p.status = filters.status;
    if (filters.doctor && filters.doctor !== "all") p.doctorId = filters.doctor;
    if (filters.department && filters.department !== "all")
      p.department = filters.department;
    if (filters.searchTerm) p.q = filters.searchTerm;
    return Object.keys(p).length ? p : null;
  }, [filters]);

  // ---- Queries -------------------------------------------------------------
  const {
    data: scheduleData,
    isFetching: isScheduleLoading,
    error: scheduleError,
  } = useGetScheduleQuery(scheduleParams ?? skipToken);

  const {
    data: listRes,
    isFetching: isListLoading,
    error: listError,
  } = useListAppointmentsQuery(listParams ?? skipToken);

  const appointments = listRes?.items ?? [];

  // ---- Mutations -----------------------------------------------------------
  const [createAppointment, { isLoading: isCreating }] =
    useCreateAppointmentMutation();
  const [setStatus] = useSetAppointmentStatusMutation();
  const [updateAppointment] = useUpdateAppointmentMutation();
  const [upsertTemplate] = useUpsertTemplateMutation();
  const [createBlock] = useCreateBlockMutation();

  // ---- Handlers ------------------------------------------------------------
  const onSlotSelect = (slot) => {
    setSelectedSlot(slot); // {doctorId,date,time,doctor}
    setEditing(null);
  };

  const onSaveAppointment = async (payload) => {
    // convert your AppointmentForm payload -> API shape
    const body = {
      date: payload.date,
      time: payload.time,
      durationMin: Number(payload.duration || 30),
      type: payload.appointmentType || "consultation",
      priority: payload.priority || "normal",
      doctorId: payload.doctorId,
      doctor: payload.doctor, // {name, department}
      // choose either patientId or snapshot (your form uses snapshot)
      patient: {
        name: payload.patientName,
        phone: payload.patientPhone,
        email: payload.patientEmail,
      },
      notes: payload.notes,
      symptoms: payload.symptoms,
      referredBy: payload.referredBy,
      insuranceProvider: payload.insuranceProvider,
      copayAmount: payload.copayAmount
        ? Number(payload.copayAmount)
        : undefined,
    };

    try {
      await createAppointment(body).unwrap();
      setSelectedSlot(null);
    } catch (e) {
      const msg =
        e?.data?.message ||
        (e?.status === 409 ? "Time slot already booked" : "Failed to save");
      // replace with your toast helper
      alert(msg);
    }
  };

  const onStartOrComplete = async (apt) => {
    const next = apt.status === "scheduled" ? "in-progress" : "completed";
    try {
      await setStatus({ id: apt._id, status: next }).unwrap();
    } catch (e) {
      alert(e?.data?.message || "Failed to update status");
    }
  };

  const onCancelAppointment = async (apt) => {
    try {
      await setStatus({ id: apt._id, status: "cancelled" }).unwrap();
    } catch (e) {
      alert(e?.data?.message || "Failed to cancel");
    }
  };

  // ---- Render --------------------------------------------------------------
  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Appointment Scheduling</h2>
          <p className="text-sm text-text-secondary">
            Manage patient appointments and doctor schedules
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === "calendar" ? "default" : "outline"}
            onClick={() => setMode("calendar")}>
            <Icon name="Calendar" className="mr-2" /> Calendar
          </Button>
          <Button
            variant={mode === "list" ? "default" : "outline"}
            onClick={() => setMode("list")}>
            <Icon name="List" className="mr-2" /> List
          </Button>
        </div>
      </div>

      {/* Quick stats from today’s list */}
      <QuickStats appointments={appointments} />

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Filters */}
        <div className="col-span-12 md:col-span-3">
          <AppointmentFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Middle: Calendar / List */}
        <div className="col-span-12 md:col-span-6">
          {mode === "calendar" ? (
            <CalendarView
              // your CalendarView already accepts these
              selectedDate={weekCursor}
              onDateChange={setWeekCursor}
              onSlotSelect={onSlotSelect}
              // pass booked appointments only if your view still needs them
              appointments={appointments}
              // you can also pass computed schedule if you’ve replaced local logic
              schedule={scheduleData}
              isLoading={isScheduleLoading}
              error={scheduleError}
              doctorId={selectedDoctorId}
              onDoctorChange={setSelectedDoctorId}
            />
          ) : (
            <AppointmentList
              appointments={appointments}
              filters={filters}
              onEdit={setEditing}
              onCancel={onCancelAppointment}
              onComplete={onStartOrComplete}
            />
          )}
        </div>

        {/* Right: Form */}
        <div className="col-span-12 md:col-span-3">
          {/* Your AppointmentForm uses selectedSlot/editing and calls onSave */}
          {/* Keep your existing component; only the onSave needs to call mutation */}
          {/* Example: */}
          {/* <AppointmentForm
              selectedSlot={selectedSlot}
              editingAppointment={editing}
              onSave={onSaveAppointment}
              onCancel={() => { setSelectedSlot(null); setEditing(null); }}
            /> */}
          <div className="border rounded-lg p-4 text-text-secondary">
            Hook your <code>AppointmentForm</code> here and call{" "}
            <code>onSaveAppointment</code>.
          </div>
        </div>
      </div>

      {(scheduleError || listError) && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {scheduleError && (
            <div>
              Schedule:{" "}
              {scheduleError?.data?.message || "Error loading schedule"}
            </div>
          )}
          {listError && (
            <div>
              Appointments:{" "}
              {listError?.data?.message || "Error loading appointments"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
