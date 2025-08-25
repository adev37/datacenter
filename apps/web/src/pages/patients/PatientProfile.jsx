import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useHasPerm from "@/hooks/useHasPerm";
import {
  useGetPatientQuery,
  useUpdatePatientMutation,
} from "@/services/patients.api";

export default function PatientProfile() {
  const { id } = useParams();
  const canEdit = useHasPerm("patient.write");

  const { data: p, isFetching } = useGetPatientQuery(id);
  const [updatePatient, { isLoading, error }] = useUpdatePatientMutation();

  const [phones, setPhones] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (p) {
      setPhones(p.phones || []);
      setAlerts(p.alerts || []);
    }
  }, [p]);

  if (isFetching) return <div className="p-4">Loading…</div>;
  if (!p?._id) return <div className="p-4">Not found</div>;

  const save = async () => {
    await updatePatient({ id, phones, alerts }).unwrap();
  };

  const serverMsg = error?.data?.message;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">
        {p?.name?.full} <span className="text-gray-500">({p.mrn})</span>
      </h1>

      {serverMsg && (
        <div className="rounded bg-red-50 border border-red-200 text-red-700 text-sm p-2">
          {serverMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-3">
          <div className="text-sm text-gray-500 mb-2">Demographics</div>
          <div>DOB: {p?.dob ? new Date(p.dob).toLocaleDateString() : "-"}</div>
          <div>Sex: {p?.sex || "-"}</div>
          <div className="mt-2">
            <div className="text-sm text-gray-500">Phone(s)</div>
            {canEdit ? (
              <textarea
                className="w-full border rounded p-2 min-h-[80px]"
                value={(phones || []).join("\n")}
                onChange={(e) =>
                  setPhones(e.target.value.split("\n").filter(Boolean))
                }
              />
            ) : (
              <pre className="text-sm">
                {(p.phones || []).join("\n") || "-"}
              </pre>
            )}
          </div>
        </div>

        <div className="border rounded p-3">
          <div className="text-sm text-gray-500 mb-2">Alerts</div>
          {canEdit ? (
            <textarea
              className="w-full border rounded p-2 min-h-[120px]"
              value={(alerts || []).join("\n")}
              onChange={(e) =>
                setAlerts(e.target.value.split("\n").filter(Boolean))
              }
            />
          ) : (
            <pre className="text-sm">{(p.alerts || []).join("\n") || "-"}</pre>
          )}
        </div>
      </div>

      {canEdit && (
        <div>
          <button
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={save}>
            {isLoading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
