// PATH: apps/web/src/pages/patients/patient-medical-record/index.jsx

import React, { useEffect, useState } from "react";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

/* tabs */
import PatientHeader from "./components/PatientHeader.jsx";
import MedicalHistoryTab from "./components/MedicalHistoryTab";
import CurrentVisitTab from "./components/CurrentVisitTab";
import LabResultsTab from "./components/LabResultsTab";
import PrescriptionsTab from "./components/PrescriptionsTab";
import DocumentsTab from "./components/DocumentsTab";
import QuickReferencePanel from "./components/QuickReferencePanel";

const PatientMedicalRecords = () => {
  const [activeTab, setActiveTab] = useState("medical-history");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  /* ----------------------------- mock patient ----------------------------- */
  const mockPatient = {
    id: "PAT-001",
    mrn: "MRN-2024-001234",
    name: "Robert Johnson",
    age: 58,
    gender: "Male",
    dob: "1965-03-15",
    phone: "(555) 123-4567",
    email: "robert.johnson@email.com",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    status: "active",
    emergencyContact: {
      name: "Mary Johnson",
      relationship: "Spouse",
      phone: "(555) 987-6543",
    },
    allergies: ["Penicillin", "Shellfish", "Latex"],
    vitals: {
      bloodPressure: {
        value: "138/82",
        unit: "mmHg",
        normal: "120-139/80-89",
        lastUpdated: "Today 10:30 AM",
      },
      heartRate: {
        value: "78",
        unit: "bpm",
        normal: "60-100",
        lastUpdated: "Today 10:30 AM",
      },
      temperature: {
        value: "98.6",
        unit: "°F",
        normal: "97.8-99.1",
        lastUpdated: "Today 10:30 AM",
      },
      respiratoryRate: {
        value: "16",
        unit: "/min",
        normal: "12-20",
        lastUpdated: "Today 10:30 AM",
      },
      oxygenSaturation: {
        value: "98",
        unit: "%",
        normal: "95-100",
        lastUpdated: "Today 10:30 AM",
      },
      weight: {
        value: "185",
        unit: "lbs",
        normal: "160-200",
        lastUpdated: "Today 10:30 AM",
      },
    },
  };

  const mockMedicalHistory = [
    {
      id: 1,
      type: "emergency",
      title: "Emergency Department Visit",
      date: "2024-01-15",
      department: "Emergency Medicine",
      doctor: "Dr. Sarah Wilson",
      chiefComplaint: "Chest pain and shortness of breath",
      diagnosis: "Acute coronary syndrome, ruled out myocardial infarction",
      soap: {
        subjective:
          "58-year-old male presents with acute onset chest pain, described as crushing, radiating to left arm. Associated with shortness of breath and diaphoresis. Pain started 2 hours ago while at rest.",
        objective:
          "Vital signs: BP 158/92, HR 88, RR 18, O2 Sat 96% on RA. Physical exam reveals anxious appearing male, diaphoretic. Cardiac exam: regular rate and rhythm, no murmurs. Lungs clear bilaterally.",
        assessment:
          "Acute chest pain, concerning for ACS. ECG shows no acute ST changes. Troponin levels pending. Risk factors include hypertension, diabetes, and hyperlipidemia.",
        plan: "Serial ECGs and cardiac enzymes. Aspirin, beta-blocker initiated. Cardiology consultation. Admit for observation and rule out MI protocol.",
      },
      medications: [
        {
          name: "Aspirin",
          dosage: "325mg",
          frequency: "Once daily",
          duration: "Ongoing",
        },
        {
          name: "Metoprolol",
          dosage: "25mg",
          frequency: "Twice daily",
          duration: "Ongoing",
        },
      ],
      tests: [
        { name: "Troponin I", status: "completed" },
        { name: "ECG", status: "completed" },
        { name: "Chest X-ray", status: "completed" },
      ],
    },
    {
      id: 2,
      type: "outpatient",
      title: "Cardiology Follow-up",
      date: "2024-01-08",
      department: "Cardiology",
      doctor: "Dr. Michael Chen",
      chiefComplaint: "Routine follow-up for hypertension and diabetes",
      diagnosis:
        "Essential hypertension, Type 2 diabetes mellitus - well controlled",
      soap: {
        subjective:
          "Patient reports good adherence to medications. No chest pain, shortness of breath, or palpitations. Blood sugars well controlled with current regimen.",
        objective:
          "BP 132/78, HR 72, Weight 185 lbs. Physical exam unremarkable. Recent HbA1c 6.8%.",
        assessment:
          "Hypertension and diabetes well controlled on current medications. Continue current regimen.",
        plan: "Continue Lisinopril and Metformin. Follow-up in 3 months. Annual eye exam scheduled.",
      },
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "Ongoing",
        },
        {
          name: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
          duration: "Ongoing",
        },
      ],
      tests: [
        { name: "HbA1c", status: "completed" },
        { name: "Lipid Panel", status: "pending" },
      ],
    },
  ];

  const mockLabResults = [
    {
      id: 1,
      testName: "Comprehensive Metabolic Panel",
      category: "chemistry",
      date: "2024-01-15",
      orderedBy: "Dr. Sarah Wilson",
      lab: "Central Laboratory",
      status: "completed",
      tests: [
        { name: "Glucose", value: "95", normalRange: "70-99", unit: "mg/dL" },
        { name: "BUN", value: "18", normalRange: "6-24", unit: "mg/dL" },
        {
          name: "Creatinine",
          value: "1.1",
          normalRange: "0.7-1.3",
          unit: "mg/dL",
        },
        { name: "Sodium", value: "140", normalRange: "136-145", unit: "mEq/L" },
        {
          name: "Potassium",
          value: "4.2",
          normalRange: "3.5-5.2",
          unit: "mEq/L",
        },
        {
          name: "Chloride",
          value: "102",
          normalRange: "98-107",
          unit: "mEq/L",
        },
      ],
    },
    {
      id: 2,
      testName: "Cardiac Enzymes",
      category: "chemistry",
      date: "2024-01-15",
      orderedBy: "Dr. Sarah Wilson",
      lab: "Central Laboratory",
      status: "completed",
      tests: [
        {
          name: "Troponin I",
          value: "0.02",
          normalRange: "<0.04",
          unit: "ng/mL",
        },
        { name: "CK-MB", value: "3.2", normalRange: "0.0-6.3", unit: "ng/mL" },
        { name: "Total CK", value: "125", normalRange: "30-200", unit: "U/L" },
      ],
    },
    {
      id: 3,
      testName: "Complete Blood Count",
      category: "hematology",
      date: "2024-01-10",
      orderedBy: "Dr. Michael Chen",
      lab: "Central Laboratory",
      status: "completed",
      tests: [
        { name: "WBC", value: "7.2", normalRange: "4.8-10.8", unit: "K/uL" },
        { name: "RBC", value: "4.5", normalRange: "4.7-6.1", unit: "M/uL" },
        {
          name: "Hemoglobin",
          value: "14.2",
          normalRange: "14.0-18.0",
          unit: "g/dL",
        },
        {
          name: "Hematocrit",
          value: "42.1",
          normalRange: "42.0-52.0",
          unit: "%",
        },
        {
          name: "Platelets",
          value: "285",
          normalRange: "150-450",
          unit: "K/uL",
        },
      ],
    },
  ];

  const mockPrescriptions = [
    {
      id: 1,
      medication: "Lisinopril",
      genericName: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      duration: "Ongoing",
      route: "Oral",
      status: "active",
      prescribedBy: "Dr. Michael Chen",
      prescribedDate: "2023-08-15",
      indication: "Essential Hypertension",
      instructions:
        "Take with or without food. Monitor blood pressure regularly.",
      priority: "medium",
      sideEffects: ["Dizziness", "Dry cough", "Hyperkalemia"],
      refillHistory: [
        {
          date: "2024-01-10",
          quantity: "30 tablets",
          pharmacy: "Central Pharmacy",
          status: "dispensed",
        },
        {
          date: "2023-12-10",
          quantity: "30 tablets",
          pharmacy: "Central Pharmacy",
          status: "dispensed",
        },
      ],
    },
    {
      id: 2,
      medication: "Metformin",
      genericName: "Metformin HCl",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "Ongoing",
      route: "Oral",
      status: "active",
      prescribedBy: "Dr. Michael Chen",
      prescribedDate: "2022-08-20",
      indication: "Type 2 Diabetes Mellitus",
      instructions: "Take with meals to reduce gastrointestinal side effects.",
      priority: "high",
      sideEffects: ["Nausea", "Diarrhea", "Metallic taste"],
      refillHistory: [
        {
          date: "2024-01-05",
          quantity: "60 tablets",
          pharmacy: "Central Pharmacy",
          status: "dispensed",
        },
        {
          date: "2023-12-05",
          quantity: "60 tablets",
          pharmacy: "Central Pharmacy",
          status: "dispensed",
        },
      ],
    },
    {
      id: 3,
      medication: "Atorvastatin",
      genericName: "Atorvastatin Calcium",
      dosage: "20mg",
      frequency: "Once daily at bedtime",
      duration: "Ongoing",
      route: "Oral",
      status: "active",
      prescribedBy: "Dr. Sarah Wilson",
      prescribedDate: "2023-03-10",
      indication: "Hyperlipidemia",
      instructions: "Take at bedtime. Avoid grapefruit juice.",
      priority: "medium",
      sideEffects: ["Muscle pain", "Liver enzyme elevation", "Headache"],
      refillHistory: [
        {
          date: "2024-01-08",
          quantity: "30 tablets",
          pharmacy: "Central Pharmacy",
          status: "dispensed",
        },
      ],
    },
  ];

  const mockDocuments = [
    {
      id: 1,
      name: "Cardiac Catheterization Report",
      category: "imaging",
      type: "pdf",
      size: 2048576,
      uploadDate: "2024-01-15",
      uploadedBy: "Dr. Sarah Wilson",
      description: "Coronary angiography results",
    },
    {
      id: 2,
      name: "Chest X-Ray",
      category: "imaging",
      type: "dicom",
      size: 5242880,
      uploadDate: "2024-01-15",
      uploadedBy: "Radiology Tech",
      description: "PA and lateral chest radiographs",
    },
    {
      id: 3,
      name: "Discharge Summary",
      category: "discharge-summaries",
      type: "pdf",
      size: 1024000,
      uploadDate: "2024-01-10",
      uploadedBy: "Dr. Michael Chen",
      description: "Hospital discharge summary",
    },
    {
      id: 4,
      name: "Lab Results - CBC",
      category: "lab-reports",
      type: "pdf",
      size: 512000,
      uploadDate: "2024-01-10",
      uploadedBy: "Lab Technician",
      description: "Complete blood count results",
    },
    {
      id: 5,
      name: "Insurance Authorization",
      category: "insurance",
      type: "pdf",
      size: 768000,
      uploadDate: "2024-01-08",
      uploadedBy: "Insurance Coordinator",
      description: "Pre-authorization for cardiac procedures",
    },
  ];

  const patientSearchOptions = [
    { value: "PAT-001", label: "Robert Johnson (MRN: MRN-2024-001234)" },
    { value: "PAT-002", label: "Sarah Davis (MRN: MRN-2024-001235)" },
    { value: "PAT-003", label: "Michael Brown (MRN: MRN-2024-001236)" },
    { value: "PAT-004", label: "Jennifer Wilson (MRN: MRN-2024-001237)" },
  ];

  const tabs = [
    { id: "medical-history", label: "Medical History", icon: "History" },
    { id: "current-visit", label: "Current Visit", icon: "FileText" },
    { id: "lab-results", label: "Lab Results", icon: "TestTube" },
    { id: "prescriptions", label: "Prescriptions", icon: "Pill" },
    { id: "documents", label: "Documents", icon: "FolderOpen" },
  ];

  useEffect(() => {
    setSelectedPatient(mockPatient);
  }, []);

  const handleSaveVisit = (visitData) => {
    console.log("Saving visit data:", visitData);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "medical-history":
        return <MedicalHistoryTab medicalHistory={mockMedicalHistory} />;
      case "current-visit":
        return (
          <CurrentVisitTab currentVisit={null} onSaveVisit={handleSaveVisit} />
        );
      case "lab-results":
        return <LabResultsTab labResults={mockLabResults} />;
      case "prescriptions":
        return <PrescriptionsTab prescriptions={mockPrescriptions} />;
      case "documents":
        return <DocumentsTab documents={mockDocuments} />;
      default:
        return <MedicalHistoryTab medicalHistory={mockMedicalHistory} />;
    }
  };

  return (
    <div className="p-6">
      {/* If your NavigationBreadcrumb supports custom items, this renders:
         Dashboard > Patients > Patient Medical Record */}
      <NavigationBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Patients", to: "/patients" },
          { label: "Patient Medical Record" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">
            Patient Medical Records
          </h1>
          <p className="text-text-secondary mt-1">
            Comprehensive clinical information management
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowPatientSearch(!showPatientSearch)}
              className="min-w-64">
              <Icon name="Search" size={16} className="mr-2" />
              {selectedPatient ? selectedPatient?.name : "Search Patient"}
              <Icon name="ChevronDown" size={16} className="ml-2" />
            </Button>

            {showPatientSearch && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg healthcare-shadow z-50">
                <div className="p-3">
                  <Input
                    type="search"
                    placeholder="Search by name or MRN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-3"
                  />
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {patientSearchOptions
                      .filter((o) =>
                        o.label
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((option) => (
                        <button
                          key={option.value}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded"
                          onClick={() => {
                            setSelectedPatient(mockPatient);
                            setShowPatientSearch(false);
                            setSearchQuery("");
                          }}>
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button variant="outline">
            <Icon name="Printer" size={16} className="mr-2" />
            Print Records
          </Button>
          <Button>
            <Icon name="Share" size={16} className="mr-2" />
            Share Records
          </Button>
        </div>
      </div>

      {selectedPatient ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main */}
          <div className="xl:col-span-3 space-y-6">
            <PatientHeader patient={selectedPatient} />

            <div className="bg-card border border-border rounded-lg">
              <div className="border-b border-border">
                <nav className="flex space-x-1 p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-text-secondary hover:text-text-primary hover:bg-muted"
                      }`}>
                      <Icon name={tab.icon} size={16} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
              <div className="p-6">{renderTabContent()}</div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="xl:col-span-1">
            <QuickReferencePanel patient={selectedPatient} />
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Icon
            name="UserSearch"
            size={64}
            className="mx-auto text-text-secondary mb-6"
          />
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Select a Patient
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Search and select a patient to view their comprehensive medical
            records, including history, lab results, prescriptions, and
            documents.
          </p>
          <Button onClick={() => setShowPatientSearch(true)}>
            <Icon name="Search" size={16} className="mr-2" />
            Search Patients
          </Button>
        </div>
      )}
    </div>
  );
};

export default PatientMedicalRecords;
