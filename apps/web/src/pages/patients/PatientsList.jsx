import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import useHasPerm from "@/hooks/useHasPerm";
import { useSearchPatientsQuery } from "@/services/patients.api";

export default function PatientsList() {
  const canCreate = useHasPerm("patient.write");
  const branchId = useSelector((s) => s.auth?.branchId);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // Do not hit /patients/search until we have a branch context
  const queryArg = branchId ? { q, page, limit: 20 } : skipToken;
  const { data, isFetching } = useSearchPatientsQuery(queryArg);

  if (!branchId) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-2">Patients</h1>
        <div className="rounded border p-3 bg-yellow-50">
          Select a branch to view patients.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Patients</h1>
        {canCreate && (
          <Link
            to="/patients/new"
            className="px-3 py-2 rounded bg-blue-600 text-white">
            Add Patient
          </Link>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Search by name, MRN, phone…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isFetching && <div>Loading…</div>}

      {!isFetching && (
        <div className="overflow-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">MRN</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">DOB</th>
                <th className="text-left p-2">Sex</th>
                <th className="text-left p-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-2">{p.mrn}</td>
                  <td className="p-2">
                    <Link
                      className="text-blue-700 hover:underline"
                      to={`/patients/${p._id}`}>
                      {p?.name?.full || "-"}
                    </Link>
                  </td>
                  <td className="p-2">
                    {p?.dob ? new Date(p.dob).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-2">{p?.sex || "-"}</td>
                  <td className="p-2">{p?.phones?.[0] || "-"}</td>
                </tr>
              ))}
              {!data?.items?.length && (
                <tr>
                  <td className="p-4" colSpan={5}>
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span className="text-sm">
          Page {data?.page || page} /{" "}
          {Math.max(1, Math.ceil((data?.total || 0) / (data?.limit || 20)))}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={!data?.hasMore}
          onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
