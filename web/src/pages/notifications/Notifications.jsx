// apps/web/src/pages/notifications/Notifications.jsx
import React from "react";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Button from "@/components/ui/Button";
import Icon from "@/components/AppIcon";
import {
  useListNotificationsQuery,
  useMarkReadMutation,
} from "@/services/notifications.api";

export default function Notifications() {
  const { data, isLoading, isError } = useListNotificationsQuery();
  const [markRead] = useMarkReadMutation();

  if (isLoading) {
    return (
      <>
        <NavigationBreadcrumb />
        <div className="rounded-xl border bg-card p-6 shadow-healthcare">
          Loading notifications…
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <NavigationBreadcrumb />
        <div className="rounded-xl border bg-card p-6 shadow-healthcare">
          Failed to load notifications.
        </div>
      </>
    );
  }

  const items = data?.items || [];

  return (
    <>
      <NavigationBreadcrumb />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-healthcare">
        {items.length === 0 ? (
          <div className="p-6 text-text-secondary">No notifications.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => (
              <li key={n._id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Icon
                    name={n.severity === "error" ? "AlertCircle" : "Bell"}
                    size={18}
                    className={
                      n.readAt ? "text-text-secondary" : "text-blue-600"
                    }
                  />
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {n.title || n.type}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {n.message}
                    </div>
                  </div>
                </div>
                {!n.readAt && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markRead(n._id)}>
                    Mark read
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
