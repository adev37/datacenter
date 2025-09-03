import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const CalendarView = ({
  selectedDate,
  onDateChange,
  onSlotSelect,
  appointments,
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // 'week' | 'day'

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
  ];

  const doctors = [
    {
      id: "dr-wilson",
      name: "Dr. Sarah Wilson",
      department: "Cardiology",
      color: "bg-blue-500",
    },
    {
      id: "dr-johnson",
      name: "Dr. Michael Johnson",
      department: "Neurology",
      color: "bg-green-500",
    },
    {
      id: "dr-brown",
      name: "Dr. Emily Brown",
      department: "Orthopedics",
      color: "bg-purple-500",
    },
    {
      id: "dr-davis",
      name: "Dr. James Davis",
      department: "Pediatrics",
      color: "bg-orange-500",
    },
  ];

  const getWeekDays = (date) => {
    const week = [];
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDays = getWeekDays(currentWeek);

  const navigateWeek = (dir) => {
    const next = new Date(currentWeek);
    next.setDate(currentWeek.getDate() + dir * 7);
    setCurrentWeek(next);
  };

  const isSlotBooked = (doctorId, date, time) =>
    appointments?.some(
      (a) =>
        a?.doctorId === doctorId &&
        a?.date === date.toISOString().split("T")[0] &&
        a?.time === time
    );

  const isSlotBlocked = (doctorId, date, time) => {
    const dow = date.getDay();
    const hour = parseInt(time.split(":")[0], 10);
    if (hour >= 12 && hour < 13) return true; // lunch
    if ((dow === 0 || dow === 6) && doctorId === "dr-wilson") return true; // sample
    return false;
  };

  const getSlotStatus = (doctorId, date, time) => {
    if (isSlotBlocked(doctorId, date, time)) return "blocked";
    if (isSlotBooked(doctorId, date, time)) return "booked";
    return "available";
  };

  const getSlotColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 hover:bg-green-200 border-green-300";
      case "booked":
        return "bg-blue-100 border-blue-300 cursor-not-allowed";
      case "blocked":
        return "bg-gray-100 border-gray-300 cursor-not-allowed";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const handleSlotClick = (doctorId, date, time) => {
    const status = getSlotStatus(doctorId, date, time);
    if (status === "available") {
      onSlotSelect({
        doctorId,
        date: date.toISOString().split("T")[0],
        time,
        doctor: doctors.find((d) => d.id === doctorId),
      });
    }
  };

  /**
   * IMPORTANT CHANGES:
   * - Root container: allow horizontal scroll only (overflow-x-auto), no vertical scrolling here.
   * - Inner body: no overflow; the outer middle panel will own the vertical scroll.
   * - min-h-0 on flex children so they can shrink within a flex column.
   */
  return (
    <div className="h-full w-full overflow-x-auto min-h-0">
      {/* toolbar (no sticky needed; the parent panel scrolls) */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <div className="text-center">
            <h4 className="font-medium">
              {currentWeek.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <p className="text-xs text-text-secondary">
              {getWeekDays(currentWeek)[0].toLocaleDateString()} –{" "}
              {getWeekDays(currentWeek)[6].toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}>
            Week
          </Button>
          <Button
            variant={viewMode === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("day")}>
            Day
          </Button>
        </div>
      </div>

      {/* grid (no vertical overflow here) */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-8 border-b bg-muted">
            <div className="p-3 text-sm font-medium text-text-secondary">
              Time
            </div>
            {weekDays.map((day, i) => (
              <div key={i} className="p-3 text-center border-l">
                <div className="text-sm font-medium">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-xs text-text-secondary">
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="divide-y">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 min-h-[56px]">
                <div className="flex items-center border-r bg-muted p-3 text-sm text-text-secondary">
                  {time}
                </div>
                {weekDays.map((day, di) => (
                  <div key={di} className="border-l p-1">
                    <div className="grid h-full grid-cols-1 gap-1">
                      {doctors.map((doc) => {
                        const status = getSlotStatus(doc.id, day, time);
                        return (
                          <div
                            key={doc.id}
                            className={`cursor-pointer rounded border p-1 text-xs ${getSlotColor(
                              status
                            )}`}
                            onClick={() => handleSlotClick(doc.id, day, time)}
                            title={`${doc.name} - ${time} - ${status}`}>
                            <div className="flex items-center gap-1">
                              <span
                                className={`h-2 w-2 rounded-full ${doc.color}`}
                              />
                              <span className="truncate">
                                {status === "booked"
                                  ? "Booked"
                                  : status === "blocked"
                                  ? "Blocked"
                                  : doc.name.split(" ")[1]}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
