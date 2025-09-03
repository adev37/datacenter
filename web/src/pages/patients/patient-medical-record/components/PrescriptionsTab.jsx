import React, { useState } from "react";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

const PrescriptionsTab = ({ prescriptions }) => {
  const [filterStatus, setFilterStatus] = useState("all");

  const statusOptions = [
    { value: "all", label: "All Prescriptions" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "discontinued", label: "Discontinued" },
    { value: "pending", label: "Pending" },
  ];

  const filtered = prescriptions?.filter((p) =>
    filterStatus === "all" ? true : p?.status === filterStatus
  );

  const statusStyles = (s) =>
    ({
      active: "text-success bg-success/10 border-success/20",
      completed: "text-text-secondary bg-muted border-border",
      discontinued: "text-error bg-error/10 border-error/20",
      pending: "text-warning bg-warning/10 border-warning/20",
    }[s] || "text-text-secondary bg-muted border-border");

  const statusIcon = (s) =>
    ({
      active: "CheckCircle",
      completed: "Check",
      discontinued: "XCircle",
      pending: "Clock",
    }[s] || "Circle");

  const priorityColor = (p) =>
    ({ high: "text-error", medium: "text-warning" }[p] ||
    "text-text-secondary");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            className="w-48"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Export List
          </Button>
          <Button size="sm">
            <Icon name="Plus" size={16} className="mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Icon name="Info" size={20} className="text-primary" />
          <div>
            <h3 className="font-medium text-primary">
              Current Active Medications
            </h3>
            <p className="text-sm text-text-secondary">
              Patient is currently taking{" "}
              {prescriptions?.filter((p) => p?.status === "active")?.length}{" "}
              active medications. Review for potential interactions before
              prescribing new medications.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered?.map((p) => (
          <div
            key={p?.id}
            className="bg-card border border-border rounded-lg healthcare-shadow">
            <div className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-text-primary text-lg">
                        {p?.medication}
                      </h3>
                      <p className="text-text-secondary">{p?.genericName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {p?.priority !== "low" && (
                        <Icon
                          name="AlertTriangle"
                          size={16}
                          className={priorityColor(p?.priority)}
                        />
                      )}
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${statusStyles(
                          p?.status
                        )}`}>
                        <Icon
                          name={statusIcon(p?.status)}
                          size={12}
                          className="mr-1"
                        />
                        {p?.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-text-secondary">
                        Dosage
                      </span>
                      <p className="text-sm font-medium text-text-primary">
                        {p?.dosage}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary">
                        Frequency
                      </span>
                      <p className="text-sm font-medium text-text-primary">
                        {p?.frequency}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary">
                        Duration
                      </span>
                      <p className="text-sm font-medium text-text-primary">
                        {p?.duration}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary">Route</span>
                      <p className="text-sm font-medium text-text-primary">
                        {p?.route}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-text-secondary">
                        Prescribed By
                      </span>
                      <p className="text-sm text-text-primary">
                        {p?.prescribedBy}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {p?.prescribedDate}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary">
                        Indication
                      </span>
                      <p className="text-sm text-text-primary">
                        {p?.indication}
                      </p>
                    </div>
                  </div>

                  {p?.instructions && (
                    <div className="mb-4">
                      <span className="text-xs text-text-secondary">
                        Special Instructions
                      </span>
                      <p className="text-sm text-text-primary bg-muted p-2 rounded mt-1">
                        {p?.instructions}
                      </p>
                    </div>
                  )}

                  {p?.sideEffects?.length > 0 && (
                    <div className="mb-4">
                      <span className="text-xs text-text-secondary">
                        Common Side Effects
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p?.sideEffects?.map((effect, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-warning/10 text-warning text-xs rounded">
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col items-center lg:items-end space-x-2 lg:space-x-0 lg:space-y-2">
                  <Button variant="outline" size="sm">
                    <Icon name="Edit" size={16} className="mr-2" />
                    Modify
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon name="Copy" size={16} className="mr-2" />
                    Refill
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon name="Printer" size={16} className="mr-2" />
                    Print
                  </Button>
                  {p?.status === "active" && (
                    <Button variant="destructive" size="sm">
                      <Icon name="XCircle" size={16} className="mr-2" />
                      Discontinue
                    </Button>
                  )}
                </div>
              </div>

              {p?.refillHistory?.length > 0 && (
                <div className="border-t border-border pt-4 mt-4">
                  <h4 className="font-medium text-text-primary mb-3 flex items-center">
                    <Icon name="RotateCcw" size={16} className="mr-2" />
                    Refill History
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-xs font-medium text-text-secondary">
                            Date
                          </th>
                          <th className="text-left py-2 text-xs font-medium text-text-secondary">
                            Quantity
                          </th>
                          <th className="text-left py-2 text-xs font-medium text-text-secondary">
                            Pharmacy
                          </th>
                          <th className="text-left py-2 text-xs font-medium text-text-secondary">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {p?.refillHistory?.map((r, i) => (
                          <tr
                            key={i}
                            className="border-b border-border last:border-b-0">
                            <td className="py-2 text-xs text-text-primary">
                              {r?.date}
                            </td>
                            <td className="py-2 text-xs text-text-primary">
                              {r?.quantity}
                            </td>
                            <td className="py-2 text-xs text-text-primary">
                              {r?.pharmacy}
                            </td>
                            <td className="py-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  r?.status === "dispensed"
                                    ? "bg-success/10 text-success"
                                    : r?.status === "pending"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-muted text-text-secondary"
                                }`}>
                                {r?.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered?.length === 0 && (
        <div className="text-center py-12">
          <Icon
            name="Pill"
            size={48}
            className="mx-auto text-text-secondary mb-4"
          />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No Prescriptions Found
          </h3>
          <p className="text-text-secondary">
            No prescriptions match the selected filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsTab;
