import React, { useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Button from "@/components/ui/Button";
import Icon from "@/components/AppIcon";
import Image from "@/components/AppImage";
import {
  useGetPatientQuery,
  useDeletePatientMutation, // Deactivate (no hide)
  useRestorePatientMutation, // Reactivate legacy deleted
  useSetPatientStatusMutation, // Activate when not deleted
  useUploadPatientPhotoMutation,
  useListPatientNotesQuery,
  useAddPatientNoteMutation,
} from "@/services/patients.api";
import { fullName, calcAge } from "@/utils/patient";
import { API_BASE, toAbsUrl } from "@/services/baseApi";

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-text-secondary">{label}</span>
    <span className="text-sm font-medium text-text-primary">
      {value || "Not provided"}
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

  const token = useSelector((s) => s.auth.token);
  const branchId = useSelector((s) => s.auth.branchId);

  const {
    data: patient,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPatientQuery(id, { skip: !id });

  const pid = patient?._id || patient?.id || id;

  const [deactivate, { isLoading: deactivating }] = useDeletePatientMutation();
  const [restore, { isLoading: restoring }] = useRestorePatientMutation();
  const [setStatus, { isLoading: settingStat }] = useSetPatientStatusMutation();
  const [uploadPhoto, { isLoading: uploadingPh }] =
    useUploadPatientPhotoMutation();
  const [addNote, { isLoading: addingNote }] = useAddPatientNoteMutation();

  const {
    data: notesData,
    isFetching: notesFetching,
    refetch: refetchNotes,
  } = useListPatientNotesQuery(pid, { skip: !pid });

  const photoSrc = useMemo(() => {
    const n = fullName(patient || {}) || "P";
    const fallback =
      "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(n);
    return toAbsUrl(patient?.photoUrl || "") || fallback;
  }, [patient]);

  const fileRef = useRef(null);

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
  const isInactive = String(patient.status).toLowerCase() !== "active";

  // PRINT (no popup)
  const handlePrint = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients/${pid}/print`, {
        method: "GET",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(branchId ? { "X-Branch-Id": String(branchId) } : {}),
        },
      });
      const html = await res.text();

      if (!res.ok || html.trim().startsWith("{")) {
        const msg = (() => {
          try {
            return JSON.parse(html)?.message;
          } catch {
            return "";
          }
        })();
        alert(
          `Failed to render print view (${res.status}). ${msg || ""}`.trim()
        );
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.setAttribute(
        "sandbox",
        "allow-modals allow-same-origin allow-scripts"
      );
      document.body.appendChild(iframe);
      iframe.srcdoc = html;
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          setTimeout(() => document.body.removeChild(iframe), 1000);
        }
      };
    } catch (e) {
      console.error(e);
      alert("Failed to render print view.");
    }
  };

  // Actions
  const handleDeactivate = async () => {
    if (!window.confirm("Deactivate this patient?")) return;
    try {
      await deactivate(pid).unwrap(); // sets status: "inactive"
      await refetch();
      alert("Patient deactivated.");
    } catch (e) {
      console.error(e);
      alert("Operation failed.");
    }
  };

  const handleReactivate = async () => {
    try {
      if (patient.isDeleted) {
        await restore(pid).unwrap(); // legacy: bring back from isDeleted
      } else {
        await setStatus({ id: pid, status: "active" }).unwrap(); // simple activate
      }
      await refetch();
      alert("Patient reactivated.");
    } catch (e) {
      console.error(e);
      alert("Operation failed.");
    }
  };

  const handleAddNote = async () => {
    const text = window.prompt("Enter a note about this patient:");
    if (!text || !text.trim()) return;
    try {
      await addNote({ id: pid, text: text.trim() }).unwrap();
      await refetchNotes();
    } catch (e) {
      console.error(e);
      alert("Failed to add note.");
    }
  };

  const pickPhoto = () => fileRef.current?.click();
  const onPhotoPicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      alert("Please choose an image file.");
      return;
    }
    try {
      await uploadPhoto({ id: pid, file }).unwrap();
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Photo upload failed.");
    } finally {
      e.target.value = "";
    }
  };

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
          <Button variant="outline" onClick={handlePrint}>
            <Icon name="Printer" size={16} className="mr-2" /> Print Profile
          </Button>
          <Button asChild>
            <Link to={`/patients/${pid}/edit`}>
              <Icon name="Edit" size={16} className="mr-2" /> Edit Details
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
                  isInactive ? "bg-muted" : "bg-success",
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

              <div className="mt-3 flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPhotoPicked}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pickPhoto}
                  loading={uploadingPh}>
                  <Icon name="ImagePlus" size={14} className="mr-2" /> Change
                  Photo
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Icon name="Calendar" size={16} className="mr-2" /> New
              Appointment
            </Button>
            <Button
              variant="outline"
              onClick={handleAddNote}
              loading={addingNote}>
              <Icon name="FileText" size={16} className="mr-2" /> Add Note
            </Button>

            {isInactive ? (
              <Button
                onClick={handleReactivate}
                loading={restoring || settingStat}>
                <Icon name="RotateCcw" size={16} className="mr-2" /> Reactivate
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                loading={deactivating}>
                <Icon name="Archive" size={16} className="mr-2" /> Deactivate
              </Button>
            )}
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

        {/* Notes */}
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
              Notes
            </h4>
            {notesFetching ? (
              <div className="text-sm text-text-secondary">Loading…</div>
            ) : (notesData?.length || 0) === 0 ? (
              <div className="text-sm text-text-secondary">No notes yet.</div>
            ) : (
              <ul className="space-y-3">
                {notesData.map((n) => (
                  <li key={n._id} className="rounded border p-3">
                    <div className="text-sm">{n.text}</div>
                    <div className="mt-1 text-xs text-text-secondary">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <Button
                variant="outline"
                onClick={handleAddNote}
                loading={addingNote}>
                <Icon name="Plus" size={14} className="mr-1" />
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
