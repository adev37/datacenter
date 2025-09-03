import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const AppointmentFilters = ({ onFiltersChange, filters }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const departmentOptions = [
    { value: "all", label: "All Departments" },
    { value: "cardiology", label: "Cardiology" },
    { value: "neurology", label: "Neurology" },
    { value: "orthopedics", label: "Orthopedics" },
    { value: "pediatrics", label: "Pediatrics" },
    { value: "dermatology", label: "Dermatology" },
    { value: "oncology", label: "Oncology" },
    { value: "psychiatry", label: "Psychiatry" },
  ];

  const doctorOptions = [
    { value: "all", label: "All Doctors" },
    { value: "dr-wilson", label: "Dr. Sarah Wilson - Cardiology" },
    { value: "dr-johnson", label: "Dr. Michael Johnson - Neurology" },
    { value: "dr-brown", label: "Dr. Emily Brown - Orthopedics" },
    { value: "dr-davis", label: "Dr. James Davis - Pediatrics" },
    { value: "dr-miller", label: "Dr. Lisa Miller - Dermatology" },
    { value: "dr-garcia", label: "Dr. Robert Garcia - Oncology" },
    { value: "dr-martinez", label: "Dr. Maria Martinez - Psychiatry" },
  ];

  const appointmentTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "consultation", label: "Consultation" },
    { value: "follow-up", label: "Follow-up" },
    { value: "emergency", label: "Emergency" },
    { value: "procedure", label: "Procedure" },
    { value: "surgery", label: "Surgery" },
    { value: "checkup", label: "Regular Checkup" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "scheduled", label: "Scheduled" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "no-show", label: "No Show" },
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      dateFrom: "",
      dateTo: "",
      department: "all",
      doctor: "all",
      appointmentType: "all",
      status: "all",
      searchTerm: "",
    });
  };

  const activeCount = Object.values(filters).filter(
    (v) => v && v !== "all"
  ).length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* sticky header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Filter" size={18} className="text-primary" />
            <h3 className="font-semibold">Appointment Filters</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded((s) => !s)}>
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
          </Button>
        </div>
        {activeCount > 0 && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs text-text-secondary">
            <Icon name="Filter" size={14} className="text-primary" />
            {activeCount} filter{activeCount > 1 ? "s" : ""} active
          </div>
        )}
      </div>

      {/* scrollable body */}
      {isExpanded && (
        <div className="flex-1 overflow-auto px-4 py-4">
          <Input
            label="Search Appointments"
            type="search"
            placeholder="Search by patient name, MRN, or phone..."
            value={filters?.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="From Date"
              type="date"
              value={filters?.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={filters?.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-4">
            <Select
              label="Department"
              options={departmentOptions}
              value={filters?.department}
              onChange={(v) => handleFilterChange("department", v)}
            />
            <Select
              label="Doctor"
              options={doctorOptions}
              value={filters?.doctor}
              onChange={(v) => handleFilterChange("doctor", v)}
              searchable
            />
            <Select
              label="Appointment Type"
              options={appointmentTypeOptions}
              value={filters?.appointmentType}
              onChange={(v) => handleFilterChange("appointmentType", v)}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={filters?.status}
              onChange={(v) => handleFilterChange("status", v)}
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Quick Filters</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  handleFilterChange("dateFrom", today);
                  handleFilterChange("dateTo", today);
                }}>
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const t = new Date();
                  t.setDate(t.getDate() + 1);
                  const d = t.toISOString().split("T")[0];
                  handleFilterChange("dateFrom", d);
                  handleFilterChange("dateTo", d);
                }}>
                Tomorrow
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const s = new Date();
                  const e = new Date();
                  e.setDate(s.getDate() + 7);
                  handleFilterChange("dateFrom", s.toISOString().split("T")[0]);
                  handleFilterChange("dateTo", e.toISOString().split("T")[0]);
                }}>
                Next 7 Days
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* sticky actions */}
      <div className="sticky bottom-0 z-10 border-t bg-card/95 px-4 py-3 backdrop-blur">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex-1">
            <Icon name="X" size={16} className="mr-2" /> Clear
          </Button>
          <Button variant="default" className="flex-1">
            <Icon name="Search" size={16} className="mr-2" /> Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFilters;
