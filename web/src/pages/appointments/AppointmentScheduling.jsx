import React, { useState, useEffect } from "react";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import AppointmentFilters from "./components/AppointmentFilters";
import CalendarView from "./components/CalendarView";
import AppointmentForm from "./components/AppointmentForm";
import AppointmentList from "./components/AppointmentList";
import QuickStats from "./components/QuickStats";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/Button";

const AppointmentScheduling = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' | 'list'
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: new Date().toISOString().split("T")[0],
    dateTo: "",
    department: "all",
    doctor: "all",
    appointmentType: "all",
    status: "all",
    searchTerm: "",
  });

  // demo data
  const mockAppointments = [
    /* ... keep your mock array exactly as-is ... */
  ];

  useEffect(() => {
    const saved = localStorage.getItem("appointments");
    if (saved) setAppointments(JSON.parse(saved));
    else {
      setAppointments(mockAppointments);
      localStorage.setItem("appointments", JSON.stringify(mockAppointments));
    }
  }, []);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setEditingAppointment(null);
  };

  const handleSaveAppointment = (appointmentData) => {
    const next = editingAppointment
      ? appointments.map((a) =>
          a.id === editingAppointment.id ? appointmentData : a
        )
      : [...appointments, appointmentData];
    setAppointments(next);
    localStorage.setItem("appointments", JSON.stringify(next));
    setSelectedSlot(null);
    setEditingAppointment(null);
  };

  const handleEditAppointment = (apt) => {
    setEditingAppointment(apt);
    setSelectedSlot(null);
  };

  const handleCancelAppointment = (apt) => {
    const next = appointments.map((a) =>
      a.id === apt.id
        ? { ...a, status: "cancelled", updatedAt: new Date().toISOString() }
        : a
    );
    setAppointments(next);
    localStorage.setItem("appointments", JSON.stringify(next));
  };

  const handleCompleteAppointment = (apt) => {
    const newStatus = apt.status === "scheduled" ? "in-progress" : "completed";
    const next = appointments.map((a) =>
      a.id === apt.id
        ? { ...a, status: newStatus, updatedAt: new Date().toISOString() }
        : a
    );
    setAppointments(next);
    localStorage.setItem("appointments", JSON.stringify(next));
  };

  // unified panel height so everything stays visible under the global header
  const panelH = "h-[calc(100vh-220px)]";

  return (
    <>
      <NavigationBreadcrumb />

      {/* Title card */}
      <div className="rounded-xl border bg-card p-5 shadow-healthcare">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Appointment Scheduling</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage patient appointments and doctor schedules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}>
              <Icon name="Calendar" size={16} className="mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}>
              <Icon name="List" size={16} className="mr-2" />
              List
            </Button>
            <Button>
              <Icon name="Plus" size={16} className="mr-2" />
              Quick Book
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <QuickStats appointments={appointments} />
      </div>

      {/* 3-column layout */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        {/* Filters (left) */}
        <section
          className={`xl:col-span-3 rounded-xl border bg-card shadow-healthcare sticky top-6 ${panelH} overflow-hidden`}>
          <AppointmentFilters filters={filters} onFiltersChange={setFilters} />
        </section>

        {/* Calendar / List (middle) – THIS OWNS VERTICAL SCROLL */}
        <section
          className={`xl:col-span-6 rounded-xl border bg-card shadow-healthcare ${panelH} overflow-auto`}>
          <div className="flex h-full flex-col min-h-0">
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={18} className="text-primary" />
                  <h3 className="font-semibold">Doctor Schedule</h3>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded border border-green-300 bg-green-200" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded border border-blue-300 bg-blue-200" />
                    Booked
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded border border-gray-300 bg-gray-200" />
                    Blocked
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {viewMode === "calendar" ? (
                <CalendarView
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onSlotSelect={handleSlotSelect}
                  appointments={appointments}
                />
              ) : (
                <div className="p-4">
                  <AppointmentList
                    appointments={appointments}
                    onEdit={handleEditAppointment}
                    onCancel={handleCancelAppointment}
                    onComplete={handleCompleteAppointment}
                    filters={filters}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Book Appointment (right) */}
        <aside
          className={`xl:col-span-3 sticky top-6 rounded-xl border bg-card shadow-healthcare ${panelH} overflow-hidden`}>
          <AppointmentForm
            selectedSlot={selectedSlot}
            editingAppointment={editingAppointment}
            onSave={handleSaveAppointment}
            onCancel={() => {
              setSelectedSlot(null);
              setEditingAppointment(null);
            }}
          />
        </aside>
      </div>
    </>
  );
};

export default AppointmentScheduling;
