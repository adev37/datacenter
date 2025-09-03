import React, { useState } from "react";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const CurrentVisitTab = ({ currentVisit, onSaveVisit }) => {
  const [soapNotes, setSoapNotes] = useState(
    currentVisit?.soap || {
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
    }
  );
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [vitals, setVitals] = useState(
    currentVisit?.vitals || {
      temperature: "",
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
    }
  );

  const templates = [
    { value: "", label: "Select Template" },
    { value: "routine-checkup", label: "Routine Checkup" },
    { value: "follow-up", label: "Follow-up Visit" },
    { value: "acute-care", label: "Acute Care" },
    { value: "chronic-management", label: "Chronic Disease Management" },
  ];

  const templateData = {
    "routine-checkup": {
      subjective:
        "Patient presents for routine annual physical examination. No acute complaints. Reports feeling well overall.",
      objective:
        "Vital signs stable. Physical examination unremarkable. No acute distress noted.",
      assessment:
        "Routine health maintenance visit. Overall health status good.",
      plan: "Continue current medications. Routine laboratory studies ordered. Return in 12 months for annual physical.",
    },
    "follow-up": {
      subjective:
        "Patient returns for follow-up of previously diagnosed condition. Reports compliance with treatment plan.",
      objective:
        "Vital signs reviewed. Clinical improvement noted since last visit.",
      assessment: "Stable condition with good response to current treatment.",
      plan: "Continue current treatment regimen. Follow-up in 4-6 weeks or as needed.",
    },
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    if (template && templateData?.[template])
      setSoapNotes(templateData[template]);
  };

  const handleSoapChange = (field, value) =>
    setSoapNotes((p) => ({ ...p, [field]: value }));
  const handleVitalChange = (field, value) =>
    setVitals((p) => ({ ...p, [field]: value }));

  const handleSave = () => {
    onSaveVisit?.({
      soap: soapNotes,
      vitals,
      timestamp: new Date().toISOString(),
      status: "draft",
    });
  };

  const handleFinalize = () => {
    onSaveVisit?.({
      soap: soapNotes,
      vitals,
      timestamp: new Date().toISOString(),
      status: "finalized",
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-text-primary">
              Current Visit - {new Date()?.toLocaleDateString()}
            </h3>
            <p className="text-sm text-text-secondary">
              Dr. Sarah Wilson • Cardiology Department
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              options={templates}
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="w-48"
            />
            <Button variant="outline" size="sm">
              <Icon name="Save" size={16} className="mr-2" />
              Auto-save: On
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* main */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center">
              <Icon name="Activity" size={20} className="mr-2 text-accent" />
              Vital Signs
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Temperature"
                placeholder="98.6°F"
                value={vitals.temperature}
                onChange={(e) =>
                  handleVitalChange("temperature", e.target.value)
                }
              />
              <Input
                label="Blood Pressure"
                placeholder="120/80"
                value={vitals.bloodPressure}
                onChange={(e) =>
                  handleVitalChange("bloodPressure", e.target.value)
                }
              />
              <Input
                label="Heart Rate"
                placeholder="72 bpm"
                value={vitals.heartRate}
                onChange={(e) => handleVitalChange("heartRate", e.target.value)}
              />
              <Input
                label="Respiratory Rate"
                placeholder="16/min"
                value={vitals.respiratoryRate}
                onChange={(e) =>
                  handleVitalChange("respiratoryRate", e.target.value)
                }
              />
              <Input
                label="O2 Saturation"
                placeholder="98%"
                value={vitals.oxygenSaturation}
                onChange={(e) =>
                  handleVitalChange("oxygenSaturation", e.target.value)
                }
              />
              <Input
                label="Weight"
                placeholder="70 kg"
                value={vitals.weight}
                onChange={(e) => handleVitalChange("weight", e.target.value)}
              />
              <Input
                label="Height"
                placeholder="170 cm"
                value={vitals.height}
                onChange={(e) => handleVitalChange("height", e.target.value)}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center">
              <Icon name="FileText" size={20} className="mr-2 text-primary" />
              SOAP Notes
            </h3>
            <div className="space-y-4">
              {[
                ["subjective", "Subjective (Patient's History)"],
                ["objective", "Objective (Physical Examination)"],
                ["assessment", "Assessment (Diagnosis)"],
                ["plan", "Plan (Treatment Plan)"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {label}
                  </label>
                  <textarea
                    className="w-full h-24 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Type here..."
                    value={soapNotes[field]}
                    onChange={(e) => handleSoapChange(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-text-primary mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start">
                <Icon name="Pill" size={16} className="mr-2" />
                Add Prescription
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start">
                <Icon name="TestTube" size={16} className="mr-2" />
                Order Lab Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start">
                <Icon name="Camera" size={16} className="mr-2" />
                Order Imaging
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start">
                <Icon name="UserCheck" size={16} className="mr-2" />
                Refer to Specialist
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start">
                <Icon name="Calendar" size={16} className="mr-2" />
                Schedule Follow-up
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center">
              <Icon
                name="AlertCircle"
                size={16}
                className="mr-2 text-warning"
              />
              Clinical Alerts
            </h3>
            <div className="space-y-3">
              <div className="bg-warning/10 border border-warning/20 rounded p-3">
                <div className="flex items-start space-x-2">
                  <Icon
                    name="AlertTriangle"
                    size={16}
                    className="text-warning mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-warning">
                      Drug Interaction
                    </p>
                    <p className="text-xs text-text-secondary">
                      Check interaction between Warfarin and new prescription
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded p-3">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary">
                      Care Protocol
                    </p>
                    <p className="text-xs text-text-secondary">
                      Diabetes care protocol suggests HbA1c test
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-text-primary mb-4">
              Save Options
            </h3>
            <div className="space-y-2">
              <Button onClick={handleSave} variant="outline" className="w-full">
                <Icon name="Save" size={16} className="mr-2" />
                Save as Draft
              </Button>
              <Button onClick={handleFinalize} className="w-full">
                <Icon name="Check" size={16} className="mr-2" />
                Finalize Visit
              </Button>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Last saved: {new Date()?.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentVisitTab;
