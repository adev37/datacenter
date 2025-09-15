// apps/web/src/pages/patients/PatientList.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Icon from "@/components/AppIcon";
import Image from "@/components/AppImage";

import { useListPatientsQuery } from "@/services/patients.api";
import { calcAge, fullName } from "@/utils/patient";

/* --------------------------------- helpers -------------------------------- */
const StatusPill = ({ status = "active" }) => {
  const map = {
    active: "bg-success/10 text-success",
    inactive: "bg-muted text-text-secondary",
    deceased: "bg-error/10 text-error",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        map[status] || map.active
      }`}>
      {status || "active"}
    </span>
  );
};

const columns = [
  { key: "mrn", label: "MRN", width: "w-[12rem]" },
  { key: "name", label: "Name", width: "w-[18rem]" },
  { key: "ageGender", label: "Age / Gender", width: "w-[9rem]" },
  { key: "phone", label: "Phone", width: "w-[12rem]" },
  { key: "lastVisit", label: "Last Visit", width: "w-[10rem]" },
  { key: "status", label: "Status", width: "w-[8rem]" },
  { key: "actions", label: "Actions", width: "w-[12rem]" },
];

/* ---------------------------------- page ---------------------------------- */
export default function PatientList() {
  // filters
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const genders = [
    { value: "all", label: "Any Gender" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const statuses = [
    { value: "all", label: "Any Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "deceased", label: "Deceased" },
  ];

  const sorters = [
    { value: "name", label: "Name (A–Z)" },
    { value: "mrn", label: "MRN" },
    { value: "lastVisit", label: "Last Visit (desc)" },
  ];

  // server params
  const params = useMemo(
    () => ({
      search: query || undefined,
      gender: gender !== "all" ? gender : undefined,
      status: status !== "all" ? status : undefined,
      sort: sortBy,
      page,
      limit,
    }),
    [query, gender, status, sortBy, page, limit]
  );

  const { data, isFetching, isLoading, isError, error } = useListPatientsQuery(
    params,
    { refetchOnMountOrArgChange: true }
  );

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const goto = (n) => setPage(Math.min(Math.max(1, n), totalPages));

  // normalize rows
  const rows = (data?.items || []).map((p) => {
    const name = fullName(p) || "—";
    const img =
      p.photoUrl ||
      "https://api.dicebear.com/7.x/initials/svg?seed=" +
        encodeURIComponent(name || "P");
    return {
      id: p._id || p.id,
      mrn: p.mrn || "—",
      name,
      age: calcAge(p.dob),
      gender: p.gender || "—",
      phone: p.phone || "—",
      lastVisit: "—",
      status: p.status || "active",
      photo: img,
    };
  });

  // Export current page to XLSX
  const handleExport = async () => {
    try {
      const XLSX = await import("xlsx");
      const exportRows = rows.map((r) => ({
        MRN: r.mrn,
        Name: r.name,
        Age: r.age ?? "",
        Gender: r.gender || "",
        Phone: r.phone || "",
        "Last Visit": r.lastVisit || "",
        Status: r.status || "",
        ID: r.id,
      }));
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Patients");
      XLSX.writeFile(wb, "patients.xlsx");
    } catch (e) {
      console.error(e);
      alert("Export failed. Make sure 'xlsx' is installed in the project.");
    }
  };

  return (
    <>
      <NavigationBreadcrumb />

      {/* page header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Patients</h1>
          <p className="text-text-secondary">
            Search, filter, and manage patient records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            title="Export current page to XLSX">
            <Icon name="Download" size={16} className="mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link to="/patients/new">
              <Icon name="Plus" size={16} className="mr-2" />
              New Patient
            </Link>
          </Button>
        </div>
      </div>

      {/* filters */}
      <div className="mb-4 rounded-xl border bg-card p-4 shadow-healthcare">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <Input
              type="search"
              placeholder="Search by name, MRN, phone…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={gender}
            onChange={(v) => {
              setGender(v);
              setPage(1);
            }}
            options={genders}
          />
          <Select
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={statuses}
          />
          <Select value={sortBy} onChange={setSortBy} options={sorters} />
        </div>
      </div>

      {/* table + pagination */}
      {/* CHANGED: outer card uses overflow-visible so the Select dropdowns are not clipped */}
      <div className="rounded-xl border bg-card shadow-healthcare overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-4 py-3 text-left text-sm font-medium text-text-primary ${c.width}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(isLoading || isFetching) && rows.length === 0 ? (
                Array.from({ length: limit }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-border">
                    <td
                      colSpan={columns.length}
                      className="px-4 py-3 text-sm text-text-secondary">
                      Loading…
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16">
                    <div className="text-center">
                      <div className="text-lg font-medium text-error">
                        Failed to load patients
                      </div>
                      <p className="text-sm text-text-secondary">
                        {(error && (error.data?.message || error.error)) ||
                          "Please try again."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-b-0">
                    {/* MRN */}
                    <td className="px-4 py-3 text-sm font-medium text-blue-700">
                      <Link
                        to={`/patients/${p.id}`}
                        className="hover:underline">
                        {p.mrn}
                      </Link>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={p.photo}
                          alt={p.name}
                          className="h-9 w-9 rounded-full border border-border object-cover"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-text-primary">
                            {p.name}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {p.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Age / Gender */}
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {(p.age ?? "—") + " / " + (p.gender || "—")}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {p.phone}
                    </td>

                    {/* Last Visit */}
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {p.lastVisit}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusPill status={p.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/patients/${p.id}`}>
                            <Icon name="Eye" size={14} className="mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="Calendar" size={14} className="mr-1" />
                          Appt
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="MoreVertical" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16">
                    <div className="text-center">
                      <Icon
                        name="UserSearch"
                        size={48}
                        className="mx-auto text-text-secondary mb-3"
                      />
                      <div className="text-lg font-medium text-text-primary">
                        No patients found
                      </div>
                      <p className="text-sm text-text-secondary">
                        Try adjusting your filters or clear the search.
                      </p>
                      <Button asChild className="mt-4">
                        <Link to="/patients/new">
                          <Icon name="Plus" size={16} className="mr-2" />
                          Create first patient
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination (Select dropdown will no longer be clipped) */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border p-3 sm:flex-row">
          <div className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-medium text-text-primary">
              {total === 0 ? 0 : (page - 1) * limit + 1}–
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-medium text-text-primary">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={String(limit)}
              onChange={(v) => {
                setLimit(Number(v));
                setPage(1);
              }}
              options={[
                { value: "10", label: "10 / page" },
                { value: "20", label: "20 / page" },
                { value: "50", label: "50 / page" },
              ]}
              className="w-32"
            />
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goto(page - 1)}
                disabled={page === 1}>
                <Icon name="ChevronLeft" size={16} />
                Prev
              </Button>
              <span className="px-2 text-sm">
                Page <span className="font-medium">{page}</span> / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goto(page + 1)}
                disabled={page === totalPages}>
                Next
                <Icon name="ChevronRight" size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
