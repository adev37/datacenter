// apps/web/src/pages/settings/components/PermissionGrid.jsx
import React, { useMemo } from "react";

export default function PermissionGrid({ allKeys = [], value = [], onChange }) {
  const set = useMemo(() => new Set(value), [value]);

  const toggle = (k) => {
    if (!onChange) return;
    const next = new Set(set);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    onChange(Array.from(next));
  };

  if (!allKeys.length) {
    return <p className="text-sm text-gray-500">No permissions defined.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
      {allKeys.map((k) => (
        <label
          key={k}
          className="flex items-center gap-2 p-2 rounded border bg-white">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={set.has(k)}
            onChange={() => toggle(k)}
          />
          <span className="text-sm font-mono">{k}</span>
        </label>
      ))}
    </div>
  );
}
