// src/components/ui/HospitalContextCard.jsx
import React from "react";
import { ChevronDown, Shield } from "lucide-react";
import { useOrg } from "@/state/orgContext";
import Icon from "../AppIcon";

export default function HospitalContextCard() {
  const {
    user,
    hospitals,
    activeHospital,
    activeHospitalId,
    setActiveHospitalId,
    isSuperAdmin,
  } = useOrg();

  if (!user) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
          {/* use a safe icon name that's guaranteed to exist */}
          <Icon name="Building2" size={18} color="white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {activeHospital?.name || "—"}
          </p>
          <p className="text-xs text-gray-500">
            {isSuperAdmin ? "Global (Super Admin)" : "Assigned Hospital"}
          </p>
        </div>
      </div>

      {/* Role chip */}
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] border bg-blue-50 text-blue-700 border-blue-200">
        <Shield className="h-3.5 w-3.5" />
        {(user?.roles?.[0] || "USER").replace(/_/g, " ")}
      </div>

      {/* Switcher for SUPER_ADMIN only */}
      {isSuperAdmin && hospitals?.length > 0 && (
        <div className="mt-3">
          <label className="text-xs text-gray-500">Switch hospital</label>
          <div className="relative mt-1">
            <select
              className="w-full h-9 pl-3 pr-8 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={activeHospitalId || ""}
              onChange={(e) => setActiveHospitalId(e.target.value)}>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Super Admin controls all hospitals.
          </p>
        </div>
      )}
    </div>
  );
}
