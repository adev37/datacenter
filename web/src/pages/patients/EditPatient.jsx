// apps/web/src/pages/patients/registration/EditPatient.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Icon from "@/components/AppIcon";
import {
  useGetPatientQuery,
  useUpdatePatientMutation,
} from "@/services/patients.api";

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: p, isLoading } = useGetPatientQuery(id, { skip: !id });
  const [updatePatient, { isLoading: saving }] = useUpdatePatientMutation();

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!p) return;
    setForm({
      firstName: p.firstName || "",
      middleName: p.middleName || "",
      lastName: p.lastName || "",
      dob: p.dob ? new Date(p.dob).toISOString().slice(0, 10) : "",
      gender: p.gender || "",
      maritalStatus: p.maritalStatus || "",
      phone: p.phone || "",
      email: p.email || "",
      address: p.address || "",
      city: p.city || "",
      state: p.state || "",
      zip: p.zip || "",
      insurer: p.insurance?.provider || "",
      plan: p.insurance?.plan || "",
      policyNo: p.insurance?.policyNo || "",
      coverage: p.insurance?.coverage || "",
      emergencyName: p.emergency?.name || "",
      emergencyRelation: p.emergency?.relationship || "",
      emergencyPhone: p.emergency?.phone || "",
    });
  }, [p]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const genders = [
    { value: "", label: "Select" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  if (isLoading || !form) {
    return (
      <>
        <NavigationBreadcrumb />
        <div className="rounded-xl border bg-card p-6 shadow-healthcare">
          Loading…
        </div>
      </>
    );
  }

  const save = async () => {
    const payload = {
      firstName: form.firstName?.trim(),
      middleName: form.middleName?.trim() || undefined,
      lastName: form.lastName?.trim(),
      dob: form.dob ? new Date(form.dob) : undefined,
      gender: form.gender || undefined,
      maritalStatus: form.maritalStatus || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      zip: form.zip || undefined,
      insurance:
        form.insurer || form.plan || form.policyNo || form.coverage
          ? {
              provider: form.insurer || undefined,
              plan: form.plan || undefined,
              policyNo: form.policyNo || undefined,
              coverage: form.coverage || undefined,
            }
          : undefined,
      emergency:
        form.emergencyName || form.emergencyRelation || form.emergencyPhone
          ? {
              name: form.emergencyName || undefined,
              relationship: form.emergencyRelation || undefined,
              phone: form.emergencyPhone || undefined,
            }
          : undefined,
    };

    // Correct call shape: { id, ...payload }
    await updatePatient({ id, ...payload }).unwrap();
    navigate(`/patients/${id}`);
  };

  return (
    <>
      <NavigationBreadcrumb />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Patient</h1>
          <p className="text-text-secondary">
            Update demographics, contacts & coverage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <Icon name="ChevronLeft" size={16} className="mr-2" /> Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            <Icon name="Save" size={16} className="mr-2" /> Save Changes
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Personal
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  First Name
                </label>
                <Input
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Last Name
                </label>
                <Input
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Middle Name
                </label>
                <Input
                  value={form.middleName}
                  onChange={(e) => update("middleName", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border px-3 py-2"
                  value={form.dob}
                  onChange={(e) => update("dob", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Gender</label>
                <Select
                  options={genders}
                  value={form.gender}
                  onChange={(v) => update("gender", v)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Marital Status
                </label>
                <Input
                  value={form.maritalStatus}
                  onChange={(e) => update("maritalStatus", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Contact
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Address
                </label>
                <Input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">City</label>
                <Input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">State</label>
                <Input
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">ZIP</label>
                <Input
                  value={form.zip}
                  onChange={(e) => update("zip", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Insurance
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Provider
                </label>
                <Input
                  value={form.insurer}
                  onChange={(e) => update("insurer", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Plan</label>
                <Input
                  value={form.plan}
                  onChange={(e) => update("plan", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Policy No
                </label>
                <Input
                  value={form.policyNo}
                  onChange={(e) => update("policyNo", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Coverage
                </label>
                <Input
                  value={form.coverage}
                  onChange={(e) => update("coverage", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Emergency
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <Input
                  value={form.emergencyName}
                  onChange={(e) => update("emergencyName", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Relationship
                </label>
                <Input
                  value={form.emergencyRelation}
                  onChange={(e) => update("emergencyRelation", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <Input
                  value={form.emergencyPhone}
                  onChange={(e) => update("emergencyPhone", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <h4 className="mb-3 text-base font-semibold text-text-primary">
              MRN
            </h4>
            <div className="text-xl font-semibold text-blue-700 tracking-wide">
              {p.mrn}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-healthcare">
            <Button asChild>
              <Link to={`/patients/${id}`}>Back to Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
