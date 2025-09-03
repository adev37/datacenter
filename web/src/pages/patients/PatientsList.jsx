// PATH: apps/web/src/pages/patients/PatientList.jsx

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Icon from "@/components/AppIcon";
import Image from "@/components/AppImage";

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
      {status}
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

/* ------------------------------- mock dataset ------------------------------ */

const seedPatients = [
  {
    id: "PAT-001",
    mrn: "MRN-018046358",
    firstName: "Robert",
    lastName: "Johnson",
    gender: "Male",
    age: 58,
    phone: "(555) 123-4567",
    lastVisit: "2024-01-15",
    status: "active",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "PAT-002",
    mrn: "MRN-018046359",
    firstName: "Sarah",
    lastName: "Davis",
    gender: "Female",
    age: 41,
    phone: "(555) 765-4321",
    lastVisit: "2024-01-10",
    status: "active",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "PAT-003",
    mrn: "MRN-018046360",
    firstName: "Michael",
    lastName: "Brown",
    gender: "Male",
    age: 65,
    phone: "(555) 444-9876",
    lastVisit: "2023-12-29",
    status: "inactive",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "PAT-004",
    mrn: "MRN-018046361",
    firstName: "Jennifer",
    lastName: "Wilson",
    gender: "Female",
    age: 52,
    phone: "(555) 333-6789",
    lastVisit: "2024-01-03",
    status: "active",
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
  },
];

// Duplicate a bit so pagination feels real
const MOCK = Array.from({ length: 24 }).map((_, i) => {
  const base = seedPatients[i % seedPatients.length];
  return {
    ...base,
    id: `PAT-${String(i + 1).padStart(3, "0")}`,
    mrn: `MRN-0180${46358 + i}`,
    lastVisit: i % 5 === 0 ? "—" : base.lastVisit,
    status: i % 11 === 0 ? "deceased" : i % 4 === 0 ? "inactive" : "active",
  };
});

/* ---------------------------------- page ---------------------------------- */

export default function PatientList() {
  // filters
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const genders = [
    { value: "all", label: "Any Gender" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
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

  // derive filtered + sorted
  const filtered = useMemo(() => {
    let list = MOCK;

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.mrn.toLowerCase().includes(q) ||
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q)
      );
    }
    if (gender !== "all") list = list.filter((p) => p.gender === gender);
    if (status !== "all") list = list.filter((p) => p.status === status);

    switch (sortBy) {
      case "mrn":
        list = [...list].sort((a, b) => a.mrn.localeCompare(b.mrn));
        break;
      case "lastVisit":
        list = [...list].sort((a, b) =>
          (b.lastVisit || "").localeCompare(a.lastVisit || "")
        );
        break;
      default:
        list = [...list].sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          )
        );
    }

    return list;
  }, [query, gender, status, sortBy]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const goto = (n) => setPage(Math.min(Math.max(1, n), totalPages));

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
          <Button variant="outline">
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

      {/* table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-healthcare">
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
              {current.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-b-0">
                  {/* MRN */}
                  <td className="px-4 py-3 text-sm font-medium text-blue-700">
                    <Link to={`/patients/${p.id}`} className="hover:underline">
                      {p.mrn}
                    </Link>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={p.photo}
                        alt={p.firstName}
                        className="h-9 w-9 rounded-full border border-border object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-text-primary">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {p.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Age / Gender */}
                  <td className="px-4 py-3 text-sm text-text-primary">
                    {p.age} / {p.gender}
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 text-sm text-text-primary">
                    {p.phone}
                  </td>

                  {/* Last Visit */}
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {p.lastVisit || "—"}
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
              ))}

              {current.length === 0 && (
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

        {/* pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border p-3 sm:flex-row">
          <div className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-medium text-text-primary">
              {total === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)}
            </span>{" "}
            of <span className="font-medium text-text-primary">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onChange={(v) => {
                setPageSize(Number(v));
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
