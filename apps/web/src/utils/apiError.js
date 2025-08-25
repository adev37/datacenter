// apps/web/src/utils/apiError.js
export function apiErrorMessage(err) {
  // RTK Query error shapes we might see
  if (!err) return "";
  if (typeof err === "string") return err;

  // fetchBaseQuery style
  if (err?.data?.message) return err.data.message;
  if (err?.error) return String(err.error);

  // zod or custom
  if (err?.data?.errors?.[0]?.message) return err.data.errors[0].message;

  return "Request failed";
}
