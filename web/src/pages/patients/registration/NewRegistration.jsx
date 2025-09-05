import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Icon from "@/components/AppIcon";
import Image from "@/components/AppImage";

import { useCreatePatientMutation } from "@/services/patients.api";
import { API_BASE } from "@/services/baseApi";

/* --------------------------------- UI bits -------------------------------- */
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

/* ------------------------------- utilities -------------------------------- */
function isValidDateStr(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return false;
  const d = new Date(yyyy_mm_dd);
  return !isNaN(+d) && yyyy_mm_dd.length >= 10;
}
function clean(obj) {
  // remove undefined, null, and "" (but keep 0/false)
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    out[k] = v;
  });
  return out;
}

/* -------------------------------- Component ------------------------------- */
export default function NewRegistration() {
  const navigate = useNavigate();
  const [createPatient, { isLoading: creating }] = useCreatePatientMutation();

  const [step, setStep] = useState(1);

  const dobRef = useRef(null);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    photo: null,
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipcode: "",
    insurer: "",
    plan: "",
    policyNo: "",
    coverage: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
  });

  const [previewUrl, setPreviewUrl] = useState(""); // for URL.revokeObjectURL
  useEffect(() => {
    if (!form.photo) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      return;
    }
    const u = URL.createObjectURL(form.photo);
    setPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.photo]);

  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  // warn on close if unsaved
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!unsaved) return;
      e.preventDefault();
      e.returnValue = ""; // required for some browsers
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unsaved]);

  const update = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setUnsaved(true);
  };

  /* ---------------------------- step validations --------------------------- */
  const requiredByStep = {
    1: ["firstName", "lastName", "dob", "gender"],
    2: ["phone", "address1", "city"],
    3: [],
    4: ["emergencyPhone"],
  };

  const errors = useMemo(() => {
    const e = {};
    // Step 1
    if (!form.firstName?.trim()) e.firstName = "First name is required";
    if (!form.lastName?.trim()) e.lastName = "Last name is required";
    if (!form.dob?.trim()) e.dob = "Date of birth is required";
    else if (!isValidDateStr(form.dob)) e.dob = "Enter a valid date";
    if (!form.gender?.trim()) e.gender = "Gender is required";
    // Step 2
    if (step >= 2) {
      if (!form.phone?.trim()) e.phone = "Phone is required";
      if (!form.address1?.trim()) e.address1 = "Address is required";
      if (!form.city?.trim()) e.city = "City is required";
      if (form.email?.trim() && !/^\S+@\S+\.\S+$/.test(form.email))
        e.email = "Invalid email";
    }
    // Step 4
    if (step >= 4) {
      if (!form.emergencyPhone?.trim())
        e.emergencyPhone = "Emergency phone is required";
    }
    return e;
  }, [form, step]);

  const hasError = (k) => touched[k] && errors[k];

  const firstErrorRef = useRef(null);
  const attachFirstError = (el) => {
    if (!firstErrorRef.current && el) firstErrorRef.current = el;
  };

  const markStepTouched = (n) => {
    const keys = requiredByStep[n] || [];
    setTouched((t) =>
      keys.reduce((acc, k) => ({ ...acc, [k]: true }), { ...t })
    );
  };

  const stepValid = (n) => {
    const keys = requiredByStep[n] || [];
    return keys.every((k) => !errors[k]);
  };

  const handleSaveDraft = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setUnsaved(false);
    }, 600);
  };

  const goNext = async () => {
    markStepTouched(step);
    firstErrorRef.current = null;

    if (!stepValid(step)) {
      setTimeout(() => {
        if (firstErrorRef.current?.scrollIntoView) {
          firstErrorRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          const focusable = firstErrorRef.current.querySelector(
            "input, select, textarea, button"
          );
          focusable?.focus?.();
        }
      }, 0);
      return;
    }

    if (step < 4) {
      setStep(step + 1);
      return;
    }
    await handleSubmit();
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  /* ------------------------------ submission ------------------------------- */
  const handleSubmit = async () => {
    if (creating) return; // double-submit guard
    try {
      const payload = clean({
        firstName: form.firstName.trim(),
        middleName: form.middleName?.trim(),
        lastName: form.lastName.trim(),
        dob: isValidDateStr(form.dob) ? new Date(form.dob) : undefined,
        gender: form.gender,
        maritalStatus: form.maritalStatus,

        phone: form.phone,
        email: form.email,

        address: [form.address1, form.address2].filter(Boolean).join(", "),
        city: form.city,
        state: form.state,
        zip: form.zipcode,

        insurance:
          form.insurer || form.plan || form.policyNo || form.coverage
            ? clean({
                provider: form.insurer,
                plan: form.plan,
                policyNo: form.policyNo,
                coverage: form.coverage,
              })
            : undefined,

        emergency:
          form.emergencyName || form.emergencyRelation || form.emergencyPhone
            ? clean({
                name: form.emergencyName,
                relationship: form.emergencyRelation,
                phone: form.emergencyPhone,
              })
            : undefined,
      });

      const created = await createPatient(payload).unwrap(); // { _id, mrn, ... }
      const patientId = created._id || created.id;

      if (patientId && form.photo) {
        try {
          const fd = new FormData();
          fd.append("photo", form.photo);
          const res = await fetch(`${API_BASE}/patients/${patientId}/photo`, {
            method: "POST",
            credentials: "include",
            body: fd,
          });
          // non-fatal if upload fails
          if (!res.ok) {
            // you can log or toast here if you have a toast system
          }
        } catch {
          // ignore upload error; continue to navigate
        }
      }

      setUnsaved(false);
      navigate(`/patients/${patientId}`);
    } catch (e) {
      const msg =
        e?.data?.message ||
        e?.error ||
        e?.message ||
        "Failed to create patient";
      alert(msg);
    }
  };

  /* ---------------------------------- data --------------------------------- */
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

  /* ---------------------------------- UI ---------------------------------- */
  return (
    <>
      <NavigationBreadcrumb />

      {/* Title + progress */}
      <div className="rounded-xl border bg-card p-5 shadow-healthcare">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Patient Registration</h1>
          <div className="text-sm text-gray-600">Step {step} of 4</div>
        </div>

        {/* progress bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* stepper dots */}
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          <StepDot
            active={step === 1}
            number={1}
            title="Personal Details"
            subtitle="Basic information"
          />
          <StepDot
            active={step === 2}
            number={2}
            title="Contact Info"
            subtitle="Address & phone"
          />
          <StepDot
            active={step === 3}
            number={3}
            title="Insurance"
            subtitle="Coverage details"
          />
          <StepDot
            active={step === 4}
            number={4}
            title="Emergency Contacts"
            subtitle="Emergency information"
          />
        </div>
      </div>

      {/* main grid (content depends on step) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT: changing card per step */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-healthcare">
          {step === 1 && (
            <>
              <h2 className="mb-4 text-lg font-semibold">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* First name */}
                <div ref={hasError("firstName") ? attachFirstError : null}>
                  <label className="mb-1 block text-sm font-medium">
                    First Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    placeholder="Enter first name"
                    value={form.firstName}
                    onBlur={() =>
                      setTouched((t) => ({ ...t, firstName: true }))
                    }
                    onChange={(e) => update("firstName", e.target.value)}
                    className={
                      hasError("firstName")
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {hasError("firstName") && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last name */}
                <div ref={hasError("lastName") ? attachFirstError : null}>
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
                    <p className="mt-1 text-xs text-red-600">
                      {errors.lastName}
                    </p>
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
                <div ref={hasError("dob") ? attachFirstError : null}>
                  <label className="mb-1 block text-sm font-medium">
                    Date of Birth <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={dobRef}
                      type="date"
                      className={`w-full rounded-md border px-3 py-2 ${
                        hasError("dob")
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      } pr-8`}
                      value={form.dob}
                      onChange={(e) => update("dob", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, dob: true }))}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        dobRef.current?.showPicker
                          ? dobRef.current.showPicker()
                          : dobRef.current?.focus()
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                      aria-label="Open calendar"
                    />
                  </div>
                  {hasError("dob") && (
                    <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
                  )}
                </div>

                {/* Gender */}
                <div ref={hasError("gender") ? attachFirstError : null}>
                  <label className="mb-1 block text-sm font-medium">
                    Gender <span className="text-red-600">*</span>
                  </label>
                  <Select
                    options={genders}
                    value={form.gender}
                    onBlur={() => setTouched((t) => ({ ...t, gender: true }))}
                    onChange={(v) => update("gender", v)}
                    className={
                      hasError("gender")
                        ? "border-red-500 focus:ring-red-500"
                        : ""
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
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="mb-4 text-lg font-semibold">Contact Info</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                  ref={hasError("phone") ? attachFirstError : null}
                  className="md:col-span-1">
                  <label className="mb-1 block text-sm font-medium">
                    Phone <span className="text-red-600">*</span>
                  </label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    onChange={(e) => update("phone", e.target.value)}
                    className={
                      hasError("phone")
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {hasError("phone") && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div
                  ref={hasError("email") ? attachFirstError : null}
                  className="md:col-span-1">
                  <label className="mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    placeholder="name@email.com"
                    value={form.email}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    onChange={(e) => update("email", e.target.value)}
                    className={
                      hasError("email")
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {hasError("email") && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div
                  ref={hasError("address1") ? attachFirstError : null}
                  className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Address Line 1 <span className="text-red-600">*</span>
                  </label>
                  <Input
                    placeholder="Street, house number"
                    value={form.address1}
                    onBlur={() => setTouched((t) => ({ ...t, address1: true }))}
                    onChange={(e) => update("address1", e.target.value)}
                    className={
                      hasError("address1")
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {hasError("address1") && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.address1}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Address Line 2
                  </label>
                  <Input
                    placeholder="Apartment, suite, etc. (optional)"
                    value={form.address2}
                    onChange={(e) => update("address2", e.target.value)}
                  />
                </div>

                <div ref={hasError("city") ? attachFirstError : null}>
                  <label className="mb-1 block text-sm font-medium">
                    City <span className="text-red-600">*</span>
                  </label>
                  <Input
                    placeholder="City"
                    value={form.city}
                    onBlur={() => setTouched((t) => ({ ...t, city: true }))}
                    onChange={(e) => update("city", e.target.value)}
                    className={
                      hasError("city")
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {hasError("city") && (
                    <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    State/Province
                  </label>
                  <Input
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    ZIP/Postal Code
                  </label>
                  <Input
                    placeholder="000000"
                    value={form.zipcode}
                    onChange={(e) => update("zipcode", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="mb-4 text-lg font-semibold">Insurance</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Insurer
                  </label>
                  <Input
                    placeholder="Provider name"
                    value={form.insurer}
                    onChange={(e) => update("insurer", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Plan</label>
                  <Input
                    placeholder="Plan"
                    value={form.plan}
                    onChange={(e) => update("plan", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Policy Number
                  </label>
                  <Input
                    placeholder="Policy #"
                    value={form.policyNo}
                    onChange={(e) => update("policyNo", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Coverage
                  </label>
                  <Input
                    placeholder="Coverage description"
                    value={form.coverage}
                    onChange={(e) => update("coverage", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="mb-4 text-lg font-semibold">Emergency Contacts</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <Input
                    placeholder="Full name"
                    value={form.emergencyName}
                    onChange={(e) => update("emergencyName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Relationship
                  </label>
                  <Input
                    placeholder="Spouse / Parent / Friend"
                    value={form.emergencyRelation}
                    onChange={(e) =>
                      update("emergencyRelation", e.target.value)
                    }
                  />
                </div>
                <div
                  className="md:col-span-2"
                  ref={hasError("emergencyPhone") ? attachFirstError : null}>
                  <label className="mb-1 block text-sm font-medium">
                    Phone <span className="text-red-600">*</span>
                  </label>
                  <Input
                    placeholder="+91 9xxxx xxxxx"
                    value={form.emergencyPhone}
                    onBlur={() =>
                      setTouched((t) => ({ ...t, emergencyPhone: true }))
                    }
                    onChange={(e) => update("emergencyPhone", e.target.value)}
                    className={
                      hasError("emergencyPhone")
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {hasError("emergencyPhone") && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.emergencyPhone}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: photo card */}
        <div className="rounded-xl border bg-card p-5 shadow-healthcare">
          <h3 className="mb-4 text-base font-semibold">Patient Photo</h3>
          <div className="grid place-content-center rounded-2xl border border-dashed bg-slate-50 p-8">
            <div className="mx-auto grid place-content-center rounded-full bg-white p-6 shadow-inner">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Patient"
                  className="h-28 w-28 rounded-full object-cover"
                />
              ) : (
                <Icon name="User" size={48} className="text-gray-400" />
              )}
            </div>

            <div className="mt-4 grid gap-2">
              <input
                ref={fileRef}
                className="hidden"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    if (f.size > 5 * 1024 * 1024) {
                      alert("Please choose an image up to 5MB.");
                      e.target.value = "";
                      return;
                    }
                    update("photo", f);
                  }
                }}
              />
              <Button
                variant="outline"
                shape="xl"
                className="w-full"
                type="button"
                onClick={() => fileRef.current?.click()}>
                <Icon name="Upload" size={16} className="mr-2" />
                Upload Photo
              </Button>
              <p className="text-center text-xs text-gray-500">
                JPG, PNG up to 5MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* sticky footer */}
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
            <Button
              variant="outline"
              onClick={goBack}
              disabled={step === 1 || creating}>
              <Icon name="ChevronLeft" size={16} className="mr-2" />
              Back
            </Button>
            <Button onClick={goNext} loading={creating} disabled={creating}>
              {step < 4 ? "Next" : "Submit"}
              <Icon name="ChevronRight" size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
