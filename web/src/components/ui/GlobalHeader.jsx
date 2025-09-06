import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Icon from "../AppIcon";
import Button from "./Button";
import { cn } from "../../utils/cn";
import { signOut } from "@/store/slices/authSlice";
import { api } from "@/services/baseApi";
import usePermChecker from "@/hooks/usePermChecker";
import useCurrentUser from "@/hooks/useCurrentUser";
import ImgWithFallback from "../ImgWithFallback";

import {
  useListNotificationsQuery,
  useUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} from "@/services/notifications.api";

export default function GlobalHeader({ onSidebarToggle, onSignOut }) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const hasPerm = usePermChecker();
  const { user, isLoading: userLoading } = useCurrentUser();

  // Unread count (lightweight)
  const { data: unreadCount = 0 } = useUnreadCountQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Unread list for dropdown
  const { data: unreadList } = useListNotificationsQuery(
    { unreadOnly: 1, page: 1, limit: 5 }, // numeric "1" is important
    {
      pollingInterval: 15000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();
  const items = unreadList?.items || [];

  const handleMarkOne = async (id) => {
    try {
      await markRead(id).unwrap();
    } catch {}
  };
  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
    } catch {}
  };

  const handleSignOut = React.useCallback(() => {
    try {
      onSignOut?.();
    } catch {}
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("X-Branch-Id");
      sessionStorage.clear();
    } catch {}
    try {
      dispatch(api.util.resetApiState());
      dispatch(signOut());
    } catch {}
    setProfileOpen(false);
    setNotificationOpen(false);
    navigate("/login", { replace: true });
  }, [dispatch, navigate, onSignOut]);

  // Close dropdowns on click-outside / ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        notificationOpen &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setNotificationOpen(false);
      }
      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [notificationOpen, profileOpen]);

  // Close when route changes
  useEffect(() => {
    setNotificationOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const mainNav = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/patients", label: "Patients", requirePerm: "patient.read" },
    {
      to: "/appointments",
      label: "Appointments",
      requirePerm: "appointment.read",
    },
    { to: "/encounters", label: "Records", requirePerm: "encounter.read" },
    { to: "/billing", label: "Billing", requirePerm: "billing.invoice" },
    { to: "/inventory", label: "Inventory", requirePerm: "inv.item" },
  ];
  const moreNav = [
    { to: "/lab", label: "Lab", requirePerm: "lab.order" },
    { to: "/radiology", label: "Radiology", requirePerm: "rad.order" },
    {
      to: "/pharmacy/dispense",
      label: "Pharmacy",
      requirePerm: "pharmacy.dispense",
    },
    { to: "/ipd/bedboard", label: "IPD", requirePerm: "ipd.admit" },
    {
      to: "/reports/finance",
      label: "Reports",
      requirePerm: "reports.finance",
    },
    { to: "/staff/doctors", label: "Staff", requirePerm: "staff.read" },
    { to: "/portal", label: "Portal", requirePerm: "patient.read" },
    {
      to: "/settings/user-management",
      label: "Settings",
      requirePerm: "settings.user",
    },
    {
      to: "/settings/audit-logs",
      label: "Audit Logs",
      requirePerm: "audit.read",
    },
    {
      to: "/notifications",
      label: "Notifications",
      requirePerm: "notifications.read",
    },
    { to: "/help", label: "Help" },
  ];
  const visibleMainNav = mainNav.filter(
    (i) => !i.requirePerm || hasPerm(i.requirePerm)
  );
  const visibleMoreNav = moreNav.filter(
    (i) => !i.requirePerm || hasPerm(i.requirePerm)
  );

  const smallFallback = (
    <div className="grid h-9 w-9 place-content-center rounded-full bg-gray-300 text-white">
      <span className="text-xs font-semibold">{user?.initials || "U"}</span>
    </div>
  );
  const largeFallback = (
    <div className="grid h-12 w-12 place-content-center rounded-full bg-gray-300 text-white">
      <span className="text-sm font-semibold">{user?.initials || "U"}</span>
    </div>
  );

  const AvatarSmall = () => (
    <ImgWithFallback
      src={user?.photoUrl}
      alt={user?.fullName || "User"}
      className="h-9 w-9 rounded-full object-cover"
      fallback={smallFallback}
    />
  );
  const AvatarLarge = () => (
    <ImgWithFallback
      src={user?.photoUrl}
      alt={user?.fullName || "User"}
      className="h-12 w-12 rounded-full object-cover"
      fallback={largeFallback}
    />
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Left: burger + brand */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="lg:hidden"
            aria-label="Toggle sidebar">
            <Icon name="Menu" size={20} />
          </Button>
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-content-center rounded-full bg-blue-600 text-white">
              <Icon name="Heart" size={18} color="white" />
            </div>
            <div className="hidden leading-tight sm:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                DataCenter
              </h1>
              <p className="-mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Hospital Management
              </p>
            </div>
          </Link>
        </div>

        {/* Center: desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {visibleMainNav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                )
              }>
              {label}
            </NavLink>
          ))}

          {/* More menu */}
          {visibleMoreNav.length > 0 && (
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                aria-haspopup="menu"
                aria-expanded="false">
                More <Icon name="ChevronDown" size={16} className="ml-1" />
              </Button>
              <div className="invisible absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-gray-800 dark:bg-gray-900">
                <ul className="py-2" role="menu">
                  {visibleMoreNav.map(({ to, label }) => (
                    <li key={to} role="none">
                      <Link
                        to={to}
                        role="menuitem"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Icon name="ChevronRight" size={14} /> {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </nav>

        {/* Right: notifications + profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setNotificationOpen((o) => !o);
                setProfileOpen(false);
              }}
              aria-expanded={notificationOpen}
              aria-haspopup="menu"
              aria-label="Notifications"
              className="relative">
              <Icon name="Bell" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-content-center rounded-full bg-red-600 text-[10px] font-semibold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Button>

            {notificationOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-800">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  {items.length > 0 && (
                    <button
                      className="text-xs font-medium text-emerald-700 hover:underline"
                      onClick={handleMarkAll}>
                      Mark all read
                    </button>
                  )}
                </div>

                <ul className="max-h-96 overflow-y-auto">
                  {items.length === 0 ? (
                    <li className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                      You’re all caught up.
                    </li>
                  ) : (
                    items.map((n) => (
                      <li
                        key={n._id}
                        className="border-b px-4 py-3 last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60">
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "mt-1 h-2.5 w-2.5 rounded-full",
                              n.severity === "error"
                                ? "bg-red-600"
                                : n.severity === "warning"
                                ? "bg-amber-500"
                                : "bg-blue-600"
                            )}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {n.title || n.message || n.kind}
                            </p>
                            {n.message && (
                              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {n.message}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {new Date(n.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            className="ml-2 rounded-md px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={() => handleMarkOne(n._id)}>
                            Mark read
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>

                <div className="p-4">
                  <Button
                    asChild
                    className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700">
                    <Link to="/notifications">View All Notifications</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setProfileOpen((o) => !o);
                setNotificationOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="group flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-emerald-700 hover:text-white">
              <AvatarSmall />
              <div className="hidden text-left leading-tight md:block">
                <p className="text-sm font-medium text-gray-900 group-hover:text-white">
                  {userLoading ? "Loading…" : user?.fullName}
                </p>
                <p className="text-xs text-gray-500 group-hover:text-white/90">
                  {user?.profession || "\u00A0"}
                </p>
              </div>
              <Icon
                name="ChevronDown"
                size={16}
                className="text-gray-500 group-hover:text-white"
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b p-4 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <AvatarLarge />
                    <div className="leading-tight">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.fullName || "User"}
                      </p>
                      {user?.profession && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.profession}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick links (permission-aware) */}
                <div className="py-2">
                  {[
                    ["/settings/profile", "User", "My Profile", null],
                    [
                      "/settings/preferences",
                      "SlidersHorizontal",
                      "Preferences",
                      "settings.preferences",
                    ],
                    [
                      "/settings/user-management",
                      "Users",
                      "User Management",
                      "settings.user",
                    ],
                    [
                      "/settings/role-permissions",
                      "ShieldCheck",
                      "Role Permissions",
                      "settings.role",
                    ],
                    [
                      "/settings/audit-logs",
                      "ClipboardList",
                      "Audit Logs",
                      "audit.read",
                    ],
                    ["/help", "HelpCircle", "Help & Support", null],
                  ]
                    .filter((x) => !x[3] || hasPerm(x[3]))
                    .map(([to, icon, label]) => (
                      <Link
                        key={to}
                        to={to}
                        className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm transition-colors hover:bg-emerald-700 hover:text-white">
                        <Icon name={icon} size={16} /> {label}
                      </Link>
                    ))}
                </div>

                <div className="border-t dark:border-gray-800">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Icon name="LogOut" size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
