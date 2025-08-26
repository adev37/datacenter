// src/components/ui/GlobalHeader.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "./Button";

const GlobalHeader = ({ onSidebarToggle }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  // const hospital_name = api.er; // Replace with dynamic data  needed

  const isActive = (base) =>
    location?.pathname === base || location?.pathname.startsWith(`${base}/`);

  const navLink = (to, label) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={[
          "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          !active && "text-gray-700 hover:bg-gray-100",
          active && "bg-blue-600 text-white shadow-sm",
        ].join(" ")}>
        {label}
      </Link>
    );
  };

  const notifications = [
    {
      id: 1,
      type: "critical",
      message: "Lab results ready for Patient #12345",
      time: "2 min ago",
    },
    {
      id: 2,
      type: "warning",
      message: "Medication interaction alert",
      time: "5 min ago",
    },
    {
      id: 3,
      type: "info",
      message: "Appointment reminder: Dr. Smith at 3:00 PM",
      time: "10 min ago",
    },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: burger + brand */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="lg:hidden"
            aria-label="Toggle sidebar">
            <Icon name="Menu" size={20} />
          </Button>

          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <Icon name="Heart" size={18} color="white" />
            </div>
            <div className="hidden sm:block leading-tight">
              <h1 className="text-lg font-semibold text-gray-900">
                DataCenter
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                Hospital Management
              </p>
            </div>
          </Link>
        </div>

        {/* Center: desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/patients", "Patients")}
          {navLink("/appointments", "Appointments")}
          {navLink("/encounters", "Records")}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:bg-gray-100">
              More <Icon name="ChevronDown" size={16} className="ml-1" />
            </Button>
          </div>
        </nav>

        {/* Right: notifications + profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setNotificationOpen((o) => !o);
                setProfileOpen(false);
              }}
              className="relative rounded-lg hover:bg-gray-100"
              aria-label="Notifications">
              <Icon name="Bell" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold rounded-full bg-red-600 text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <h3 className="font-medium text-gray-900">Notifications</h3>
                </div>
                <ul className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <span
                          className={[
                            "mt-1 w-2.5 h-2.5 rounded-full",
                            n.type === "critical"
                              ? "bg-red-600"
                              : n.type === "warning"
                              ? "bg-amber-500"
                              : "bg-blue-600",
                          ].join(" ")}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{n.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="p-4">
                  {/* Link to a future full notifications page */}
                  <Button
                    asChild
                    className="w-full h-10 bg-emerald-600 text-white hover:bg-emerald-700">
                    <Link to="/notifications">View All Notifications</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen((o) => !o);
                setNotificationOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100"
              aria-label="Profile menu">
              <div className="w-9 h-9 rounded-full bg-gray-300 text-white flex items-center justify-center">
                <Icon name="User" size={18} color="white" />
              </div>
              <div className="hidden md:block text-left leading-tight">
                <p className="text-sm font-medium text-gray-900">
                  Dr. Sarah Wilson
                </p>
                <p className="text-xs text-gray-500">Cardiologist</p>
              </div>
              <Icon name="ChevronDown" size={16} className="text-gray-500" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 text-white flex items-center justify-center">
                      <Icon name="User" size={20} color="white" />
                    </div>
                    <div className="leading-tight">
                      <p className="font-medium text-gray-900">
                        Dr. Sarah Wilson
                      </p>
                      <p className="text-sm text-gray-500">Cardiologist</p>
                      <p className="text-xs text-gray-500">
                        Shift: 8:00 AM - 6:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  {/* All items below are real links now */}
                  <Link
                    to="/settings/profile"
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                    <Icon name="User" size={16} /> Profile Settings
                  </Link>

                  <Link
                    to="/settings/preferences"
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                    <Icon name="Settings" size={16} /> Preferences
                  </Link>

                  <div className="px-2 py-1">
                    <Button
                      asChild
                      className="w-full h-10 bg-emerald-600 text-white hover:bg-emerald-700">
                      <Link
                        to="/help"
                        className="flex items-center justify-center gap-2">
                        <Icon name="HelpCircle" size={16} /> Help &amp; Support
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="border-t">
                  {/* keep Sign Out as a button you’ll wire to your auth later */}
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <Icon name="LogOut" size={16} />
                    <Link to="/login">Sign Out</Link>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
