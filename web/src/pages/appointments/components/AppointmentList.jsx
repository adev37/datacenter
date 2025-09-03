import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const AppointmentList = ({
  appointments,
  onEdit,
  onCancel,
  onComplete,
  filters,
}) => {
  const [sortBy, setSortBy] = useState("time");
  const [sortOrder, setSortOrder] = useState("asc");

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no-show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "emergency":
        return "text-red-600";
      case "urgent":
        return "text-orange-600";
      case "high":
        return "text-yellow-600";
      case "normal":
        return "text-green-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "emergency":
        return "AlertTriangle";
      case "urgent":
        return "AlertCircle";
      case "high":
        return "ArrowUp";
      case "normal":
        return "Minus";
      case "low":
        return "ArrowDown";
      default:
        return "Minus";
    }
  };

  const filtered = appointments?.filter((a) => {
    if (filters?.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      if (
        !a?.patientName?.toLowerCase().includes(q) &&
        !a?.patientPhone?.includes(filters.searchTerm) &&
        !a?.tokenNumber?.toLowerCase().includes(q)
      )
        return false;
    }
    if (
      filters?.department !== "all" &&
      a?.doctor?.department !== filters?.department
    )
      return false;
    if (filters?.doctor !== "all" && a?.doctorId !== filters?.doctor)
      return false;
    if (
      filters?.appointmentType !== "all" &&
      a?.appointmentType !== filters?.appointmentType
    )
      return false;
    if (filters?.status !== "all" && a?.status !== filters?.status)
      return false;
    if (filters?.dateFrom && a?.date < filters?.dateFrom) return false;
    if (filters?.dateTo && a?.date > filters?.dateTo) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let A, B;
    switch (sortBy) {
      case "time":
        A = `${a.date} ${a.time}`;
        B = `${b.date} ${b.time}`;
        break;
      case "patient":
        A = a.patientName;
        B = b.patientName;
        break;
      case "doctor":
        A = a?.doctor?.name || "";
        B = b?.doctor?.name || "";
        break;
      case "status":
        A = a.status;
        B = b.status;
        break;
      case "priority":
        const order = { emergency: 5, urgent: 4, high: 3, normal: 2, low: 1 };
        A = order[a.priority] || 0;
        B = order[b.priority] || 0;
        break;
      default:
        A = a[sortBy];
        B = b[sortBy];
    }
    if (A < B) return sortOrder === "asc" ? -1 : 1;
    if (A > B) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const formatTime = (t) => {
    const [h, m] = t.split(":");
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m));
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const formatDate = (s) =>
    new Date(s).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="bg-card border border-border rounded-lg healthcare-shadow">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="List" size={20} className="text-primary" />
            <h3 className="font-semibold text-text-primary">
              Appointments ({sorted.length})
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="Printer" size={16} className="mr-2" /> Print
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <span className="text-sm text-text-secondary">Sort by:</span>
          {["time", "patient", "doctor", "status", "priority"].map((f) => (
            <Button
              key={f}
              variant={sortBy === f ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSort(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {sortBy === f && (
                <Icon
                  name={sortOrder === "asc" ? "ArrowUp" : "ArrowDown"}
                  size={14}
                  className="ml-1"
                />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* CHANGE: removed max-h-96/overflow-auto to avoid nested scrolling in List view */}
      <div className="divide-y divide-border">
        {sorted.length === 0 ? (
          <div className="p-8 text-center">
            <Icon
              name="Calendar"
              size={48}
              className="text-muted-foreground mx-auto mb-4"
            />
            <h4 className="font-medium text-text-primary mb-2">
              No Appointments Found
            </h4>
            <p className="text-text-secondary">
              No appointments match your current filters. Try adjusting your
              search criteria.
            </p>
          </div>
        ) : (
          sorted.map((a) => (
            <div
              key={a.id}
              className="p-4 hover:bg-muted healthcare-transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {a?.patientName
                          ?.split(" ")
                          ?.map((n) => n?.[0])
                          ?.join("")}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">
                        {a.patientName}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {a.patientPhone} • Token: {a.tokenNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-text-secondary">Date & Time</p>
                      <p className="text-sm font-medium text-text-primary">
                        {formatDate(a.date)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {formatTime(a.time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Doctor</p>
                      <p className="text-sm font-medium text-text-primary">
                        {a?.doctor?.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {a?.doctor?.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Type</p>
                      <p className="text-sm font-medium text-text-primary capitalize">
                        {a.appointmentType}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {a.duration} min
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Priority</p>
                      <div className="flex items-center space-x-1">
                        <Icon
                          name={getPriorityIcon(a.priority)}
                          size={14}
                          className={getPriorityColor(a.priority)}
                        />
                        <span
                          className={`text-sm font-medium capitalize ${getPriorityColor(
                            a.priority
                          )}`}>
                          {a.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          a.status
                        )}`}>
                        {a.status.replace("-", " ").toUpperCase()}
                      </span>
                      {a.symptoms && (
                        <span className="text-sm text-text-secondary truncate max-w-xs">
                          {a.symptoms}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {a.status === "scheduled" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(a)}>
                        <Icon name="Edit" size={14} className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onComplete(a)}>
                        <Icon name="Check" size={14} className="mr-1" /> Start
                      </Button>
                    </>
                  )}

                  {a.status === "in-progress" && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onComplete(a)}>
                      <Icon name="CheckCircle" size={14} className="mr-1" />{" "}
                      Complete
                    </Button>
                  )}

                  {["scheduled", "confirmed"].includes(a.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancel(a)}
                      className="text-error hover:text-error">
                      <Icon name="X" size={14} className="mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentList;
