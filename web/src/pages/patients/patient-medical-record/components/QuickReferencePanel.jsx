import React from "react";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/Button";

const QuickReferencePanel = () => {
  const currentMedications = [
    {
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      status: "active",
    },
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      status: "active",
    },
    {
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      status: "active",
    },
    {
      name: "Aspirin",
      dosage: "81mg",
      frequency: "Once daily",
      status: "active",
    },
  ];

  const activeDiagnoses = [
    {
      code: "I10",
      diagnosis: "Essential Hypertension",
      date: "2023-01-15",
      status: "active",
    },
    {
      code: "E11.9",
      diagnosis: "Type 2 Diabetes Mellitus",
      date: "2022-08-20",
      status: "active",
    },
    {
      code: "E78.5",
      diagnosis: "Hyperlipidemia",
      date: "2023-03-10",
      status: "active",
    },
  ];

  const recentVitals = [
    {
      parameter: "Blood Pressure",
      value: "138/82",
      unit: "mmHg",
      date: "Today",
      status: "high",
    },
    {
      parameter: "Heart Rate",
      value: "78",
      unit: "bpm",
      date: "Today",
      status: "normal",
    },
    {
      parameter: "Temperature",
      value: "98.6",
      unit: "°F",
      date: "Today",
      status: "normal",
    },
    {
      parameter: "Weight",
      value: "185",
      unit: "lbs",
      date: "Today",
      status: "normal",
    },
  ];

  const careTeam = [
    {
      name: "Dr. Sarah Wilson",
      role: "Primary Cardiologist",
      phone: "(555) 123-4567",
      status: "available",
    },
    {
      name: "Dr. Michael Chen",
      role: "Endocrinologist",
      phone: "(555) 234-5678",
      status: "busy",
    },
    {
      name: "Nurse Jennifer Adams",
      role: "Care Coordinator",
      phone: "(555) 345-6789",
      status: "available",
    },
    {
      name: "Dr. Lisa Rodriguez",
      role: "Pharmacist",
      phone: "(555) 456-7890",
      status: "available",
    },
  ];

  const color = (s) =>
    ({
      high: "text-error",
      low: "text-warning",
      active: "text-success",
      available: "text-success",
      busy: "text-warning",
    }[s] || "text-text-primary");

  const icon = (s) =>
    ({ available: "CheckCircle", busy: "Clock", active: "CheckCircle" }[s] ||
    "Circle");

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4 healthcare-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary flex items-center">
            <Icon name="Pill" size={16} className="mr-2 text-primary" />
            Current Medications
          </h3>
          <Button variant="ghost" size="sm">
            <Icon name="Plus" size={14} />
          </Button>
        </div>
        <div className="space-y-3">
          {currentMedications.map((m, i) => (
            <div key={i} className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-text-primary text-sm">
                  {m.name}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    m.status === "active" ? "bg-success" : "bg-muted"
                  }`}
                />
              </div>
              <p className="text-xs text-text-secondary">
                {m.dosage} • {m.frequency}
              </p>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3">
          View All Medications
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 healthcare-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary flex items-center">
            <Icon name="Stethoscope" size={16} className="mr-2 text-accent" />
            Active Diagnoses
          </h3>
          <Button variant="ghost" size="sm">
            <Icon name="Plus" size={14} />
          </Button>
        </div>
        <div className="space-y-3">
          {activeDiagnoses.map((d, i) => (
            <div key={i} className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-text-primary text-sm">
                  {d.diagnosis}
                </span>
                <span className="text-xs text-text-secondary bg-primary/10 text-primary px-2 py-1 rounded">
                  {d.code}
                </span>
              </div>
              <p className="text-xs text-text-secondary">Since {d.date}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3">
          View All Diagnoses
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 healthcare-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary flex items-center">
            <Icon name="Activity" size={16} className="mr-2 text-success" />
            Recent Vitals
          </h3>
          <Button variant="ghost" size="sm">
            <Icon name="TrendingUp" size={14} />
          </Button>
        </div>
        <div className="space-y-3">
          {recentVitals.map((v, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <span className="text-sm text-text-primary">{v.parameter}</span>
                <p className="text-xs text-text-secondary">{v.date}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${color(v.status)}`}>
                  {v.value} {v.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3">
          View Vital Trends
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 healthcare-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary flex items-center">
            <Icon name="Users" size={16} className="mr-2 text-secondary" />
            Care Team
          </h3>
          <Button variant="ghost" size="sm">
            <Icon name="MessageCircle" size={14} />
          </Button>
        </div>
        <div className="space-y-3">
          {careTeam.map((m, i) => (
            <div key={i} className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-text-primary text-sm">
                  {m.name}
                </span>
                <Icon
                  name={icon(m.status)}
                  size={12}
                  className={color(m.status)}
                />
              </div>
              <p className="text-xs text-text-secondary mb-1">{m.role}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{m.phone}</span>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="p-1">
                    <Icon name="Phone" size={12} />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Icon name="MessageSquare" size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3">
          Contact Care Team
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 healthcare-shadow">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center">
          <Icon name="Zap" size={16} className="mr-2 text-warning" />
          Quick Actions
        </h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Icon name="Calendar" size={14} className="mr-2" />
            Schedule Follow-up
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Icon name="TestTube" size={14} className="mr-2" />
            Order Lab Tests
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Icon name="FileText" size={14} className="mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Icon name="Share" size={14} className="mr-2" />
            Share Records
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickReferencePanel;
