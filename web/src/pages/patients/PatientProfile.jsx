// apps/web/src/pages/patients/PatientProfile.jsx
import React, { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom"; // ← add Link
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Button from "@/components/ui/Button";
import Icon from "@/components/AppIcon";
import Image from "@/components/AppImage";
import { useGetPatientQuery } from "@/services/patients.api";
import { fullName, calcAge } from "@/utils/patient";
import { toAbsUrl } from "@/services/baseApi";

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
  const { id } = useParams();

  useEffect(() => {
    try {
      localStorage.setItem("lastPatientId", id || "");
    } catch {}
  }, [id]);

  const { data, isLoading, isError, error } = useGetPatientQuery(id, {
    skip: !id,
  });

  const patient = data || null;
  const pid = patient?._id || patient?.id || id;

  const photoSrc = useMemo(() => {
    const n = fullName(patient || {}) || "P";
    const fallback =
      "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(n);
    return toAbsUrl(patient?.photoUrl || "") || fallback;
  }, [patient]);

  if (isLoading) {
    return (
      <>
        <NavigationBreadcrumb />
        <div className="rounded-xl border bg-card p-6 shadow-healthcare">
          Loading profile…
        </div>
      </>
    );
  }

  if (isError || !patient) {
    return (
      <>
        <NavigationBreadcrumb />
        <div className="rounded-xl border bg-card p-6 shadow-healthcare">
          <div className="text-lg font-medium text-error">
            Failed to load patient
          </div>
          <p className="text-sm text-text-secondary">
            {(error && (error.data?.message || error.error)) || "Not found."}
          </p>
        </div>
      </>
    );
  }

  const age = calcAge(patient.dob);
  const displayName = fullName(patient);

  return (
    <>
      <NavigationBreadcrumb />

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
          <Button asChild>
            <Link to={`/patients/${pid}/edit`}>
              <Icon name="Edit" size={16} className="mr-2" />
              Edit Details
            </Link>
          </Button>
        </div>
      </div>
      {/* Header card */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-healthcare">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={photoSrc}
                alt={displayName}
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
                {displayName}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span>MRN: {patient.mrn || "—"}</span>
                <span>•</span>
                <span>
                  {(age ?? "—") + " yrs"}, {patient.gender || "—"}
                </span>
                {patient.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <Icon name="Phone" size={14} className="mr-1" />
                      {patient.phone}
                    </span>
                  </>
                )}
                {patient.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <Icon name="Mail" size={14} className="mr-1" />
                      {patient.email}
                    </span>
                  </>
                )}
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
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Row label="First Name" value={patient.firstName} />
              <Row label="Last Name" value={patient.lastName} />
              <Row label="Middle Name" value={patient.middleName} />
              <Row label="Date of Birth" value={patient.dob?.slice?.(0, 10)} />
              <Row label="Gender" value={patient.gender} />
              <Row label="Marital Status" value={patient.maritalStatus} />
            </div>
          </div>

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

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h4 className="mb-2 text-sm font-medium text-text-secondary">
              Medical Record Number
            </h4>
            <div className="text-xl font-semibold text-blue-700 tracking-wide">
              {patient.mrn || "—"}
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Generated MRN • Use for all documentation
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h4 className="mb-3 text-base font-semibold text-text-primary">
              Registration Status
            </h4>
            <div className="divide-y divide-border">
              <CheckItem
                done={Boolean(displayName)}
                text="Personal details collected"
              />
              <CheckItem
                done={Boolean(patient.phone || patient.email)}
                text="Contact details added"
              />
              <CheckItem
                done={Boolean(patient.insurance?.provider)}
                text="Insurance verification pending"
              />
              <CheckItem
                done={Boolean(patient.emergency?.phone)}
                text="Emergency contacts added"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
