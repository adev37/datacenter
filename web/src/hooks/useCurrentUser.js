// apps/web/src/hooks/useCurrentUser.js
import { useMemo } from "react";
import { useGetMeQuery } from "@/services/users.api";
import { toAbsUrl } from "@/services/baseApi";

export default function useCurrentUser() {
  const { data, isLoading, isFetching, error } = useGetMeQuery();

  const normalized = useMemo(() => {
    const u = data || {};
    const fullName =
      u.fullName ||
      [u.title, u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
      u.name ||
      "User";

    const profession = u.profession || u?.role?.name || u.jobTitle || "";

    const shiftStart = u?.shift?.start || "08:00";
    const shiftEnd = u?.shift?.end || "18:00";
    const shiftLabel = `Shift: ${shiftStart} - ${shiftEnd}`;

    // 👉 absolute URL + cache bust by updatedAt (or Date.now fallback)
    const rawPhoto = u.avatarUrl || u.photoUrl || null;
    const version = u.updatedAt || "";
    const photoUrl = rawPhoto
      ? `${toAbsUrl(rawPhoto)}?v=${encodeURIComponent(version)}`
      : null;

    const initials = fullName
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return { raw: u, fullName, profession, shiftLabel, photoUrl, initials };
  }, [data]);

  return { user: normalized, isLoading: isLoading || isFetching, error };
}
