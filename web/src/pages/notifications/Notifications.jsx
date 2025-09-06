// apps/web/src/pages/notifications/Notifications.jsx
import React from "react";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import Button from "@/components/ui/Button";
import Icon from "@/components/AppIcon";
import {
  useListNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} from "@/services/notifications.api";

export default function Notifications() {
  const { data, isLoading, isError, refetch } = useListNotificationsQuery(
    { page: 1, limit: 50 }, // page shows ALL by default
    { refetchOnMountOrArgChange: true }
  );
  const [markRead, { isLoading: marking }] = useMarkReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllReadMutation();

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
        {items.length > 0 && (
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await markAllRead().unwrap();
                refetch(); // refresh page list to show them as read
              } catch {}
            }}
            loading={markingAll}>
            <Icon name="CheckCheck" size={16} className="mr-2" />
            Mark all read
          </Button>
        )}
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
                      {n.title || n.kind}
                    </div>
                    {n.message && (
                      <div className="text-xs text-text-secondary">
                        {n.message}
                      </div>
                    )}
                    <div className="mt-0.5 text-xs text-text-secondary">
                      {new Date(
                        n.createdAt || n.updatedAt || Date.now()
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>

                {!n.readAt && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await markRead(n._id).unwrap();
                        refetch();
                      } catch {}
                    }}
                    loading={marking}>
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
