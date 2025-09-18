import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const AppointmentForm = ({
  selectedSlot,
  onSave,
  onCancel,
  editingAppointment,
}) => {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    appointmentType: "consultation",
    duration: "30",
    priority: "normal",
    notes: "",
    symptoms: "",
    referredBy: "",
    insuranceProvider: "",
    copayAmount: "",
  });

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);

  const mockPatients = []; // keep as-is / later swap to real patient search

  const appointmentTypeOptions = [
    { value: "consultation", label: "Consultation" },
    { value: "follow-up", label: "Follow-up" },
    { value: "emergency", label: "Emergency" },
    { value: "procedure", label: "Procedure" },
    { value: "surgery", label: "Surgery" },
    { value: "checkup", label: "Regular Checkup" },
    { value: "vaccination", label: "Vaccination" },
  ];
  const durationOptions = [
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
  ];
  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "normal", label: "Normal Priority" },
    { value: "high", label: "High Priority" },
    { value: "urgent", label: "Urgent" },
    { value: "emergency", label: "Emergency" },
  ];
  const insuranceOptions = [
    { value: "", label: "No Insurance" },
    { value: "blue-cross", label: "Blue Cross Blue Shield" },
    { value: "aetna", label: "Aetna" },
    { value: "cigna", label: "Cigna" },
    { value: "united", label: "United Healthcare" },
    { value: "medicare", label: "Medicare" },
    { value: "medicaid", label: "Medicaid" },
  ];

  useEffect(() => {
    if (editingAppointment) {
      // normalize fields from backend doc
      setFormData({
        patientId: editingAppointment.patientId || "",
        patientName: editingAppointment.patient?.name || "",
        patientPhone: editingAppointment.patient?.phone || "",
        patientEmail: editingAppointment.patient?.email || "",
        appointmentType: editingAppointment.type || "consultation",
        duration: String(editingAppointment.durationMin || 30),
        priority: editingAppointment.priority || "normal",
        notes: editingAppointment.notes || "",
        symptoms: editingAppointment.symptoms || "",
        referredBy: editingAppointment.referredBy || "",
        insuranceProvider: editingAppointment.insuranceProvider || "",
        copayAmount: editingAppointment.copayAmount ?? "",
      });
    }
  }, [editingAppointment]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "patientName" && value?.length > 2) {
      setIsSearching(true);
      setTimeout(() => {
        const results = mockPatients.filter(
          (p) =>
            p.name.toLowerCase().includes(value.toLowerCase()) ||
            p.phone.includes(value) ||
            p.mrn.toLowerCase().includes(value.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
    }
  };

  const selectPatient = (p) => {
    setFormData((prev) => ({
      ...prev,
      patientId: p.id,
      patientName: p.name,
      patientPhone: p.phone,
      patientEmail: p.email,
    }));
    setSearchResults([]);
  };

  const calculateEstimatedTime = () => {
    const t = editingAppointment?.time || selectedSlot?.time;
    if (!t) return "";
    const [h, m] = t.split(":");
    const dt = new Date();
    dt.setHours(parseInt(h), parseInt(m), 0, 0);
    return dt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    // Build backend payload
    const payload = {
      date: editingAppointment?.date || selectedSlot?.date,
      time: editingAppointment?.time || selectedSlot?.time,
      durationMin: Number(formData.duration || 30),
      type: formData.appointmentType,
      priority: formData.priority,
      doctorId: editingAppointment?.doctorId || selectedSlot?.doctorId, // required
      doctor: editingAppointment?.doctor || selectedSlot?.doctor || {}, // optional snapshot
      patientId: formData.patientId || undefined,
      patient: {
        name: formData.patientName,
        phone: formData.patientPhone,
        email: formData.patientEmail,
      },
      notes: formData.notes,
      symptoms: formData.symptoms,
      referredBy: formData.referredBy,
      insuranceProvider: formData.insuranceProvider,
      copayAmount:
        formData.copayAmount !== "" ? Number(formData.copayAmount) : undefined,
    };

    onSave(payload);
  };

  if (!selectedSlot && !editingAppointment) {
    return (
      <div className="flex h-full items-center justify-center overflow-hidden px-6">
        <div className="text-center">
          <Icon
            name="Calendar"
            size={48}
            className="mx-auto mb-4 text-muted-foreground"
          />
          <h3 className="mb-1 text-lg font-medium">Select a time slot</h3>
          <p className="text-sm text-text-secondary">
            Pick any available slot from the calendar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="sticky top-0 z-10 border-b bg-card/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="UserPlus" size={18} className="text-primary" />
            <h3 className="font-semibold">
              {editingAppointment ? "Edit Appointment" : "Book Appointment"}
            </h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <Icon name="X" size={16} />
          </Button>
        </div>

        <div className="mt-3 rounded-lg bg-muted p-3">
          <div className="mb-1 flex items-center gap-2">
            <Icon name="Clock" size={16} className="text-primary" />
            <span className="font-medium">
              {(editingAppointment?.date || selectedSlot?.date) ?? ""} at{" "}
              {calculateEstimatedTime()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Icon name="User" size={16} />
            <span>
              {editingAppointment?.doctor?.name ||
                selectedSlot?.doctor?.name ||
                "Doctor"}{" "}
              •{" "}
              {editingAppointment?.doctor?.department ||
                selectedSlot?.doctor?.department ||
                "Department"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Patient Information</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewPatient((s) => !s)}>
              {showNewPatient ? "Search Existing" : "New Patient"}
            </Button>
          </div>

          {!showNewPatient ? (
            <div className="relative">
              <Input
                placeholder="Search by name, phone, or MRN..."
                value={formData?.patientName}
                onChange={(e) =>
                  handleInputChange("patientName", e.target.value)
                }
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <Icon
                    name="Loader2"
                    size={16}
                    className="animate-spin text-primary"
                  />
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-lg border bg-popover shadow">
                  {searchResults.map((p) => (
                    <div
                      key={p.id}
                      className="cursor-pointer border-b p-3 hover:bg-muted last:border-b-0"
                      onClick={() => selectPatient(p)}>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-text-secondary">
                        {p.phone} • {p.mrn}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Full Name"
                required
                value={formData?.patientName}
                onChange={(e) =>
                  handleInputChange("patientName", e.target.value)
                }
              />
              <Input
                label="Phone Number"
                type="tel"
                required
                value={formData?.patientPhone}
                onChange={(e) =>
                  handleInputChange("patientPhone", e.target.value)
                }
              />
              <Input
                label="Email Address"
                type="email"
                value={formData?.patientEmail}
                onChange={(e) =>
                  handleInputChange("patientEmail", e.target.value)
                }
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Appointment Type"
              required
              options={appointmentTypeOptions}
              value={formData?.appointmentType}
              onChange={(v) => handleInputChange("appointmentType", v)}
            />
            <Select
              label="Duration"
              options={durationOptions}
              value={formData?.duration}
              onChange={(v) => handleInputChange("duration", v)}
            />
          </div>

          <Select
            label="Priority Level"
            options={priorityOptions}
            value={formData?.priority}
            onChange={(v) => handleInputChange("priority", v)}
          />

          <Input
            label="Chief Complaint / Symptoms"
            placeholder="Brief description..."
            value={formData?.symptoms}
            onChange={(e) => handleInputChange("symptoms", e.target.value)}
          />
          <Input
            label="Referred By"
            placeholder="Referring doctor or self-referral"
            value={formData?.referredBy}
            onChange={(e) => handleInputChange("referredBy", e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Insurance Provider"
              options={insuranceOptions}
              value={formData?.insuranceProvider}
              onChange={(v) => handleInputChange("insuranceProvider", v)}
            />
            <Input
              label="Copay Amount"
              type="number"
              placeholder="0.00"
              value={formData?.copayAmount}
              onChange={(e) => handleInputChange("copayAmount", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Special Instructions / Notes
            </label>
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border p-3 focus:border-primary focus:ring-2 focus:ring-primary"
              value={formData?.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="sticky bottom-0 z-10 border-t bg-card/95 px-4 py-3 backdrop-blur">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1">
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} className="flex-1">
            <Icon name="Check" size={16} className="mr-2" />
            {editingAppointment ? "Update Appointment" : "Book Appointment"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
