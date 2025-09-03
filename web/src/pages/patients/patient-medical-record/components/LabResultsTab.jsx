import React, { useState } from "react";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

const LabResultsTab = ({ labResults }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  const categories = [
    { value: "all", label: "All Tests" },
    { value: "hematology", label: "Hematology" },
    { value: "chemistry", label: "Chemistry" },
    { value: "microbiology", label: "Microbiology" },
    { value: "immunology", label: "Immunology" },
    { value: "pathology", label: "Pathology" },
  ];

  const timeframes = [
    { value: "all", label: "All Time" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
    { value: "1year", label: "Last Year" },
  ];

  const getResultStatus = (value, normalRange) => {
    if (!value || !normalRange) return "normal";
    const numValue = parseFloat(value);
    if (Number.isNaN(numValue)) return "normal";
    const [min, max] = normalRange
      ?.split("-")
      ?.map((n) => parseFloat(n?.trim()));
    if (numValue < min) return "low";
    if (numValue > max) return "high";
    return "normal";
  };

  const pillStyles = (status) =>
    ({
      high: "text-error bg-error/10 border-error/20",
      low: "text-warning bg-warning/10 border-warning/20",
      critical: "text-error bg-error/20 border-error/30",
      normal: "text-success bg-success/10 border-success/20",
    }[status]);

  const statusIcon = (s) =>
    ({
      high: "TrendingUp",
      low: "TrendingDown",
      critical: "AlertTriangle",
      normal: "CheckCircle",
    }[s]);

  const filteredResults = labResults?.filter((r) => {
    if (selectedCategory !== "all" && r?.category !== selectedCategory)
      return false;
    if (selectedTimeframe !== "all") {
      const d = new Date(r.date);
      const now = new Date();
      const days = (now - d) / (1000 * 60 * 60 * 24);
      return (
        (selectedTimeframe === "7days" && days <= 7) ||
        (selectedTimeframe === "30days" && days <= 30) ||
        (selectedTimeframe === "90days" && days <= 90) ||
        (selectedTimeframe === "1year" && days <= 365)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            options={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="w-40"
          />
          <Select
            options={timeframes}
            value={selectedTimeframe}
            onChange={setSelectedTimeframe}
            className="w-40"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}>
            <Icon name="Table" size={16} className="mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === "timeline" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("timeline")}>
            <Icon name="Timeline" size={16} className="mr-2" />
            Timeline
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {filteredResults?.some((r) =>
        r?.tests?.some(
          (t) => getResultStatus(t?.value, t?.normalRange) === "critical"
        )
      ) && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-error" />
            <div>
              <h3 className="font-medium text-error">
                Critical Values Detected
              </h3>
              <p className="text-sm text-text-secondary">
                Some lab results require immediate attention. Please review
                highlighted values.
              </p>
            </div>
          </div>
        </div>
      )}

      {viewMode === "table" ? (
        <div className="space-y-4">
          {filteredResults?.map((result) => (
            <div
              key={result?.id}
              className="bg-card border border-border rounded-lg healthcare-shadow">
              <div className="p-4 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {result?.testName}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {result?.date} • {result?.orderedBy} • {result?.lab}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        result?.status === "completed"
                          ? "bg-success/10 text-success"
                          : result?.status === "pending"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-text-secondary"
                      }`}>
                      {result?.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Icon name="FileText" size={16} className="mr-2" />
                      View Report
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-sm font-medium text-text-primary">
                          Test
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-text-primary">
                          Result
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-text-primary">
                          Normal Range
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-text-primary">
                          Unit
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-text-primary">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result?.tests?.map((test, i) => {
                        const status = getResultStatus(
                          test?.value,
                          test?.normalRange
                        );
                        return (
                          <tr
                            key={i}
                            className="border-b border-border last:border-b-0">
                            <td className="py-3 text-sm text-text-primary">
                              {test?.name}
                            </td>
                            <td
                              className={`py-3 text-sm font-medium ${
                                status === "normal"
                                  ? "text-text-primary"
                                  : status === "high"
                                  ? "text-error"
                                  : "text-warning"
                              }`}>
                              {test?.value}
                            </td>
                            <td className="py-3 text-sm text-text-secondary">
                              {test?.normalRange}
                            </td>
                            <td className="py-3 text-sm text-text-secondary">
                              {test?.unit}
                            </td>
                            <td className="py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${pillStyles(
                                  status
                                )}`}>
                                <Icon
                                  name={statusIcon(status)}
                                  size={12}
                                  className="mr-1"
                                />
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-6">
            {filteredResults?.map((result) => (
              <div
                key={result?.id}
                className="relative flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full border-4 border-card flex items-center justify-center">
                  <Icon name="TestTube" size={16} color="white" />
                </div>
                <div className="flex-1 bg-card border border-border rounded-lg p-4 healthcare-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-text-primary">
                      {result?.testName}
                    </h3>
                    <span className="text-sm text-text-secondary">
                      {result?.date}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    {result?.orderedBy} • {result?.lab}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {result?.tests?.slice(0, 6)?.map((test, i) => {
                      const status = getResultStatus(
                        test?.value,
                        test?.normalRange
                      );
                      return (
                        <div key={i} className="bg-muted p-2 rounded">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-text-secondary">
                              {test?.name}
                            </span>
                            <Icon
                              name={statusIcon(status)}
                              size={12}
                              className={
                                status === "high"
                                  ? "text-error"
                                  : status === "low"
                                  ? "text-warning"
                                  : "text-success"
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span
                              className={`text-sm font-medium ${
                                status === "normal"
                                  ? "text-text-primary"
                                  : status === "high"
                                  ? "text-error"
                                  : "text-warning"
                              }`}>
                              {test?.value} {test?.unit}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredResults?.length === 0 && (
        <div className="text-center py-12">
          <Icon
            name="TestTube"
            size={48}
            className="mx-auto text-text-secondary mb-4"
          />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No Lab Results Found
          </h3>
          <p className="text-text-secondary">
            No lab results match the selected filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default LabResultsTab;
