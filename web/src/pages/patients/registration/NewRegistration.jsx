// PATH: apps/web/src/pages/patients/registration/NewRegistration.jsx

import React, { useMemo, useState } from "react";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Icon from "@/components/AppIcon";
import Image from "@/components/AppImage";

const StepDot = ({ active, number, title, subtitle }) => (
  <div className="flex flex-col items-center text-center">
    <div
      className={[
        "grid h-9 w-9 place-content-center rounded-full border text-sm font-medium",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white text-gray-600 border-gray-200",
      ].join(" ")}>
      {number}
    </div>
    <div className="mt-2 text-sm">{title}</div>
    <div className="text-xs text-gray-500">{subtitle}</div>
  </div>
);

export default function NewRegistration() {
  // form model
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    photo: null,
  });

  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  // simple validators (only the ones shown as * in your mock)
  const errors = useMemo(() => {
    const e = {};
    if (!form.firstName?.trim()) e.firstName = "First name is required";
    if (!form.lastName?.trim()) e.lastName = "Last name is required";
    if (!form.dob?.trim()) e.dob = "Date of birth is required";
    if (!form.gender?.trim()) e.gender = "Gender is required";
    return e;
  }, [form]);

  const hasError = (k) => touched[k] && errors[k];

  const update = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setUnsaved(true);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    // simulate draft save
    setTimeout(() => {
      setSaving(false);
      setUnsaved(false);
    }, 600);
  };

  const handleNext = () => {
    // mark required as touched to show errors
    setTouched({
      firstName: true,
      lastName: true,
      dob: true,
      gender: true,
    });
    if (Object.keys(errors).length === 0) {
      console.log("Step 1 valid -> continue", form);
    }
  };

  const genders = [
    { value: "", label: "Select an option" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const marital = [
    { value: "", label: "Select an option" },
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Divorced", label: "Divorced" },
    { value: "Widowed", label: "Widowed" },
  ];

  return (
    <>
      {/* Use DashboardLayout's container/padding */}
      <NavigationBreadcrumb />

      {/* Page title card */}
      <div className="rounded-xl border bg-card p-5 shadow-healthcare">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Patient Registration</h1>
          <div className="text-sm text-gray-600">Step 1 of 4</div>
        </div>

        {/* progress line */}
        <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
          <div className="h-2 w-1/4 rounded-full bg-blue-600" />
        </div>

        {/* stepper */}
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          <StepDot
            active
            number={1}
            title="Personal Details"
            subtitle="Basic information"
          />
          <StepDot number={2} title="Contact Info" subtitle="Address & phone" />
          <StepDot number={3} title="Insurance" subtitle="Coverage details" />
          <StepDot
            number={4}
            title="Emergency Contacts"
            subtitle="Emergency information"
          />
        </div>
      </div>

      {/* main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Personal info card */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-healthcare">
          <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* First name */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                First Name <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Enter first name"
                value={form.firstName}
                onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
                onChange={(e) => update("firstName", e.target.value)}
                className={
                  hasError("firstName")
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {hasError("firstName") && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
              )}
            </div>

            {/* Last name */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Last Name <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Enter last name"
                value={form.lastName}
                onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
                onChange={(e) => update("lastName", e.target.value)}
                className={
                  hasError("lastName")
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {hasError("lastName") && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>

            {/* Middle name */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Middle Name
              </label>
              <Input
                placeholder="Enter middle name (optional)"
                value={form.middleName}
                onChange={(e) => update("middleName", e.target.value)}
              />
            </div>

            {/* DOB */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Date of Birth <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Input
                  placeholder="dd-mm-yyyy"
                  value={form.dob}
                  onBlur={() => setTouched((t) => ({ ...t, dob: true }))}
                  onChange={(e) => update("dob", e.target.value)}
                  className={
                    hasError("dob")
                      ? "pr-8 border-red-500 focus:ring-red-500"
                      : "pr-8"
                  }
                />
                <Icon
                  name="Calendar"
                  size={16}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
              {hasError("dob") && (
                <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Gender <span className="text-red-600">*</span>
              </label>
              <Select
                options={genders}
                value={form.gender}
                onBlur={() => setTouched((t) => ({ ...t, gender: true }))}
                onChange={(v) => update("gender", v)}
                className={
                  hasError("gender") ? "border-red-500 focus:ring-red-500" : ""
                }
              />
              {hasError("gender") && (
                <p className="mt-1 text-xs text-red-600">{errors.gender}</p>
              )}
            </div>

            {/* Marital Status */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Marital Status
              </label>
              <Select
                options={marital}
                value={form.maritalStatus}
                onChange={(v) => update("maritalStatus", v)}
              />
            </div>
          </div>
        </div>

        {/* Photo card */}
        <div className="rounded-xl border bg-card p-5 shadow-healthcare">
          <h3 className="mb-4 text-base font-semibold">Patient Photo</h3>

          <div className="grid place-content-center rounded-2xl border border-dashed bg-slate-50 p-8">
            <div className="mx-auto grid place-content-center rounded-full bg-white p-6 shadow-inner">
              {form.photo ? (
                <Image
                  src={URL.createObjectURL(form.photo)}
                  alt="Patient"
                  className="h-28 w-28 rounded-full object-cover"
                />
              ) : (
                <Icon name="User" size={48} className="text-gray-400" />
              )}
            </div>

            <div className="mt-4 grid gap-2">
              <label className="inline-flex w-full cursor-pointer items-center justify-center">
                <input
                  className="hidden"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) update("photo", f);
                  }}
                />
                <Button variant="outline" shape="xl" className="w-full">
                  <Icon name="Upload" size={16} className="mr-2" />
                  Upload Photo
                </Button>
              </label>
              <p className="text-center text-xs text-gray-500">
                JPG, PNG up to 5MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* sticky footer bar (container width, no sidebar offsets) */}
      <div className="sticky bottom-0 z-40 border-t bg-white/95 backdrop-blur mt-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              loading={saving}>
              <Icon name="Save" size={16} className="mr-2" />
              Save Draft
            </Button>
            {unsaved && (
              <span className="inline-flex items-center text-sm text-amber-600">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleNext}>
              Next
              <Icon name="ChevronRight" size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
