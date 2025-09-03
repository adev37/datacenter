// PATH: apps/web/src/pages/patients/PatientProfile.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Button from "@/components/ui/Button";
import Icon from "@/components/AppIcon";
import Image from "@/components/AppImage";

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-text-secondary">{label}</span>
    <span className="text-sm font-medium text-text-primary">
      {value || "Not provided"}
    </span>
  </div>
);

const CheckItem = ({ done, text }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-text-primary">{text}</span>
    <span
      className={[
        "inline-flex h-5 w-5 items-center justify-center rounded-full",
        done ? "bg-success text-white" : "bg-muted text-text-secondary",
      ].join(" ")}
      title={done ? "Completed" : "Pending"}>
      {done ? <Icon name="Check" size={12} /> : <Icon name="Minus" size={12} />}
    </span>
  </div>
);

export default function PatientProfile() {
  const [patient, setPatient] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    try {
      localStorage.setItem("lastPatientId", id || "");
    } catch {}
  }, [id]);

  // Mock data – replace with real fetch later
  useEffect(() => {
    setPatient({
      id: "PAT-001",
      mrn: "MRN-018046358",
      status: "active",
      firstName: "Robert",
      middleName: "",
      lastName: "Johnson",
      gender: "Male",
      maritalStatus: "Married",
      dob: "15-03-1965",
      age: 58,
      phone: "(555) 123-4567",
      email: "robert.johnson@email.com",
      address: "221B Baker Street, London",
      city: "London",
      state: "—",
      zip: "NW1",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      insurance: {
        provider: "MediCare Plus",
        plan: "Gold",
        policyNo: "MC-PL-998877",
        coverage: "Inpatient & Outpatient",
      },
      emergency: {
        name: "Mary Johnson",
        relationship: "Spouse",
        phone: "(555) 987-6543",
      },
      registrationFlags: {
        personal: true,
        contact: false,
        insurance: true,
        emergency: false,
      },
    });
  }, []);

  if (!patient) return null;

  return (
    <>
      <NavigationBreadcrumb />

      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">
            Patient Profile
          </h1>
          <p className="text-text-secondary">
            Demographics, contacts, and coverage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Icon name="Printer" size={16} className="mr-2" />
            Print Profile
          </Button>
          <Button>
            <Icon name="Edit" size={16} className="mr-2" />
            Edit Details
          </Button>
        </div>
      </div>

      {/* Header card */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-healthcare">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={patient.photo}
                alt={patient.firstName}
                className="h-16 w-16 rounded-full border-2 border-border object-cover"
              />
              <span
                className={[
                  "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-card",
                  patient.status === "active" ? "bg-success" : "bg-muted",
                ].join(" ")}
              />
            </div>
            <div>
              <div className="text-2xl font-semibold text-text-primary">
                {patient.firstName} {patient.lastName}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span>MRN: {patient.mrn}</span>
                <span>•</span>
                <span>
                  {patient.age} yrs, {patient.gender}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Icon name="Phone" size={14} className="mr-1" />
                  {patient.phone}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Icon name="Mail" size={14} className="mr-1" />
                  {patient.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Icon name="Calendar" size={16} className="mr-2" />
              New Appointment
            </Button>
            <Button variant="outline">
              <Icon name="FileText" size={16} className="mr-2" />
              Add Note
            </Button>
            <Button variant="destructive">
              <Icon name="Archive" size={16} className="mr-2" />
              Deactivate
            </Button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: 2 cols */}
        <div className="xl:col-span-2 space-y-6">
          {/* Personal details */}
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Row label="First Name" value={patient.firstName} />
              <Row label="Last Name" value={patient.lastName} />
              <Row label="Middle Name" value={patient.middleName} />
              <Row label="Date of Birth" value={patient.dob} />
              <Row label="Gender" value={patient.gender} />
              <Row label="Marital Status" value={patient.maritalStatus} />
            </div>
          </div>

          {/* Contact info */}
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Row label="Phone" value={patient.phone} />
              <Row label="Email" value={patient.email} />
              <Row label="Address" value={patient.address} />
              <Row label="City" value={patient.city} />
              <Row label="State" value={patient.state} />
              <Row label="Postal Code" value={patient.zip} />
            </div>
          </div>

          {/* Insurance */}
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Insurance
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Row label="Provider" value={patient.insurance?.provider} />
              <Row label="Plan" value={patient.insurance?.plan} />
              <Row label="Policy No." value={patient.insurance?.policyNo} />
              <Row label="Coverage" value={patient.insurance?.coverage} />
            </div>
          </div>

          {/* Emergency */}
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Row label="Name" value={patient.emergency?.name} />
              <Row
                label="Relationship"
                value={patient.emergency?.relationship}
              />
              <Row label="Phone" value={patient.emergency?.phone} />
            </div>
          </div>
        </div>

        {/* Right: sidebar cards */}
        <div className="space-y-6">
          {/* Photo */}
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h4 className="mb-4 text-base font-semibold text-text-primary">
              Patient Photo
            </h4>
            <div className="grid place-content-center rounded-2xl border border-dashed bg-slate-50 p-8">
              <div className="mx-auto grid place-content-center rounded-full bg-white p-6 shadow-inner">
                <Image
                  src={patient.photo}
                  alt={patient.firstName}
                  className="h-28 w-28 rounded-full object-cover"
                />
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full" shape="xl">
              <Icon name="Upload" size={16} className="mr-2" />
              Update Photo
            </Button>
            <p className="mt-2 text-center text-xs text-gray-500">
              JPG, PNG up to 5MB
            </p>
          </div>

          {/* MRN */}
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h4 className="mb-2 text-sm font-medium text-text-secondary">
              Medical Record Number
            </h4>
            <div className="text-xl font-semibold text-blue-700 tracking-wide">
              {patient.mrn}
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Generated MRN • Use for all medical documentation
            </p>
          </div>

          {/* Registration summary */}
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h4 className="mb-3 text-base font-semibold text-text-primary">
              Registration Summary
            </h4>
            <div className="divide-y divide-border">
              <Row
                label="Full Name"
                value={`${patient.firstName} ${patient.lastName}`}
              />
              <Row label="Date of Birth" value={patient.dob} />
              <Row label="Gender" value={patient.gender} />
              <Row label="Phone" value={patient.phone} />
              <Row label="Email" value={patient.email} />
              <Row label="Insurance" value={patient.insurance?.provider} />
              <Row label="Emergency Contact" value={patient.emergency?.name} />
            </div>
          </div>

          {/* Registration status */}
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h4 className="mb-3 text-base font-semibold text-text-primary">
              Registration Status
            </h4>
            <div className="divide-y divide-border">
              <CheckItem
                done={patient.registrationFlags.personal}
                text="Personal details collected"
              />
              <CheckItem
                done={patient.registrationFlags.contact}
                text="Contact details added"
              />
              <CheckItem
                done={patient.registrationFlags.insurance}
                text="Insurance verification pending"
              />
              <CheckItem
                done={patient.registrationFlags.emergency}
                text="Emergency contacts added"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
