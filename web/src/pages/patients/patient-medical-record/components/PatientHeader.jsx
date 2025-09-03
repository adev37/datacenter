import React from "react";
import Icon from "@/components/AppIcon";
import Image from "@/components/AppImage";

const PatientHeader = ({ patient }) => {
  const getVitalStatus = (vital, normal) => {
    if (!vital || !normal) return "normal";
    const value = parseFloat(vital);
    const [min, max] = normal?.split("-")?.map((n) => parseFloat(n));
    if (value < min || value > max) return "critical";
    return "normal";
  };

  const badge = (status) => {
    switch (status) {
      case "critical":
        return "text-error bg-error/10";
      case "warning":
        return "text-warning bg-warning/10";
      default:
        return "text-success bg-success/10";
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6 healthcare-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={patient?.photo}
              alt={patient?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card ${
                patient?.status === "active" ? "bg-success" : "bg-muted"
              }`}
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              {patient?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-text-secondary">
              <span>MRN: {patient?.mrn}</span>
              <span>•</span>
              <span>
                {patient?.age} years, {patient?.gender}
              </span>
              <span>•</span>
              <span>DOB: {patient?.dob}</span>
              <span>•</span>
              <span className="flex items-center">
                <Icon name="Phone" size={14} className="mr-1" />
                {patient?.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary">
              Emergency Contact
            </p>
            <p className="text-sm text-text-secondary">
              {patient?.emergencyContact?.name}
            </p>
            <p className="text-sm text-text-secondary">
              {patient?.emergencyContact?.phone}
            </p>
          </div>
          <Icon name="Users" size={20} className="text-text-secondary" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
        <div>
          <h3 className="font-medium text-text-primary mb-3 flex items-center">
            <Icon
              name="AlertTriangle"
              size={16}
              className="mr-2 text-warning"
            />
            Allergies & Alerts
          </h3>
          <div className="flex flex-wrap gap-2">
            {patient?.allergies?.map((a, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-error/10 text-error text-sm rounded-full border border-error/20">
                {a}
              </span>
            ))}
            {patient?.allergies?.length === 0 && (
              <span className="text-sm text-text-secondary">
                No known allergies
              </span>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-text-primary mb-3 flex items-center">
            <Icon name="Activity" size={16} className="mr-2 text-accent" />
            Latest Vital Signs
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(patient?.vitals)?.map(([key, vital]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary capitalize">
                  {key?.replace(/([A-Z])/g, " $1")}
                </span>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded ${badge(
                    getVitalStatus(vital?.value, vital?.normal)
                  )}`}>
                  {vital?.value} {vital?.unit}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Last updated: {patient?.vitals?.lastUpdated}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;
