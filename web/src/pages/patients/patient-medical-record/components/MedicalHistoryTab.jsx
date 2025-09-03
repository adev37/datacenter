import React, { useState } from "react";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/Button";

const MedicalHistoryTab = ({ medicalHistory }) => {
  const [expandedVisit, setExpandedVisit] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const filteredHistory = medicalHistory?.filter((visit) => {
    if (filterType === "all") return true;
    return visit?.type === filterType;
  });

  const typeIcon = (t) =>
    ({
      emergency: "AlertTriangle",
      inpatient: "Bed",
      outpatient: "User",
      surgery: "Scissors",
    }[t] || "FileText");

  const typeColor = (t) =>
    ({
      emergency: "text-error bg-error/10",
      inpatient: "text-warning bg-warning/10",
      outpatient: "text-primary bg-primary/10",
      surgery: "text-accent bg-accent/10",
    }[t] || "text-text-secondary bg-muted");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-text-primary">
          Filter by:
        </span>
        {["all", "emergency", "inpatient", "outpatient", "surgery"].map(
          (type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className="capitalize">
              {type}
            </Button>
          )
        )}
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-6">
          {filteredHistory?.map((visit) => (
            <div
              key={visit?.id}
              className="relative flex items-start space-x-4">
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-full border-4 border-card flex items-center justify-center ${typeColor(
                  visit?.type
                )}`}>
                <Icon name={typeIcon(visit?.type)} size={20} />
              </div>

              <div className="flex-1 bg-card border border-border rounded-lg healthcare-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {visit?.title}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {visit?.date} • {visit?.department}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${typeColor(
                          visit?.type
                        )}`}>
                        {visit?.type}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedVisit(
                            expandedVisit === visit?.id ? null : visit?.id
                          )
                        }>
                        <Icon
                          name={
                            expandedVisit === visit?.id
                              ? "ChevronUp"
                              : "ChevronDown"
                          }
                          size={16}
                        />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-text-secondary">
                        Doctor
                      </span>
                      <p className="text-sm font-medium text-text-primary">
                        {visit?.doctor}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary">
                        Chief Complaint
                      </span>
                      <p className="text-sm text-text-primary">
                        {visit?.chiefComplaint}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary">
                        Diagnosis
                      </span>
                      <p className="text-sm text-text-primary">
                        {visit?.diagnosis}
                      </p>
                    </div>
                  </div>

                  {expandedVisit === visit?.id && (
                    <div className="border-t border-border pt-4 mt-4 space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">
                            Subjective
                          </h4>
                          <p className="text-sm text-text-secondary bg-muted p-3 rounded">
                            {visit?.soap?.subjective}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">
                            Objective
                          </h4>
                          <p className="text-sm text-text-secondary bg-muted p-3 rounded">
                            {visit?.soap?.objective}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">
                            Assessment
                          </h4>
                          <p className="text-sm text-text-secondary bg-muted p-3 rounded">
                            {visit?.soap?.assessment}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">
                            Plan
                          </h4>
                          <p className="text-sm text-text-secondary bg-muted p-3 rounded">
                            {visit?.soap?.plan}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">
                            Medications Prescribed
                          </h4>
                          <div className="space-y-2">
                            {visit?.medications?.map((m, i) => (
                              <div
                                key={i}
                                className="bg-muted p-2 rounded text-sm">
                                <span className="font-medium">{m?.name}</span> -{" "}
                                {m?.dosage}
                                <br />
                                <span className="text-text-secondary">
                                  {m?.frequency} for {m?.duration}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">
                            Tests Ordered
                          </h4>
                          <div className="space-y-2">
                            {visit?.tests?.map((t, i) => (
                              <div
                                key={i}
                                className="bg-muted p-2 rounded text-sm">
                                <span className="font-medium">{t?.name}</span>
                                <br />
                                <span className="text-text-secondary">
                                  Status: {t?.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredHistory?.length === 0 && (
        <div className="text-center py-12">
          <Icon
            name="FileText"
            size={48}
            className="mx-auto text-text-secondary mb-4"
          />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No Medical History Found
          </h3>
          <p className="text-text-secondary">
            No medical history records match the selected filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryTab;
