import React from "react";

export default function NotAuthorized() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">403 — Not authorized</h1>
      <p className="text-gray-600">
        You don’t have permission to view this page.
      </p>
    </div>
  );
}
