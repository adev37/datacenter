// PATH: apps/web/src/pages/appointments/components/QuickStats.jsx

import React from "react";
import Icon from "../../../components/AppIcon";

const QuickStats = ({ appointments }) => {
  const today = new Date().toISOString().split("T")[0];
  const todayApts = appointments?.filter((a) => a?.date === today) || [];

  const stats = {
    total: todayApts.length,
    scheduled: todayApts.filter((a) => a.status === "scheduled").length,
    inProgress: todayApts.filter((a) => a.status === "in-progress").length,
    completed: todayApts.filter((a) => a.status === "completed").length,
    cancelled: todayApts.filter((a) => a.status === "cancelled").length,
    noShow: todayApts.filter((a) => a.status === "no-show").length,
  };

  const cards = [
    {
      title: "Total Today",
      value: stats.total,
      icon: "Calendar",
      color: "bg-blue-500",
      text: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Scheduled",
      value: stats.scheduled,
      icon: "Clock",
      color: "bg-orange-500",
      text: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: "Activity",
      color: "bg-yellow-500",
      text: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: "CheckCircle",
      color: "bg-green-500",
      text: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: "XCircle",
      color: "bg-red-500",
      text: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "No Show",
      value: stats.noShow,
      icon: "AlertTriangle",
      color: "bg-gray-500",
      text: "text-gray-600",
      bg: "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((s, i) => (
        <div
          key={i}
          className={`${s.bg} border border-border rounded-lg p-4 healthcare-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                {s.title}
              </p>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            </div>
            <div
              className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center`}>
              <Icon name={s.icon} size={20} color="white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
