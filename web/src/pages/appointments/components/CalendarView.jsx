import React, { useMemo, useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";

const HOURS = [
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

const CalendarView = ({
  doctors = [],
  activeDoctorId,
  onDoctorChange,
  scheduleDays = [],
  scheduleLoading = false,
  onSlotSelect,
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekDays = useMemo(() => {
    const w = [];
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      w.push(d);
    }
    return w;
  }, [currentWeek]);

  const mapByDate = useMemo(() => {
    const m = new Map();
    for (const d of scheduleDays) m.set(d.date, d.slots || []);
    return m;
  }, [scheduleDays]);

  const getSlotStatus = (isoDate, time) => {
    const slots = mapByDate.get(isoDate) || [];
    const hit = slots.find((s) => s.time === time);
    return hit?.status || "blocked"; // fallback
  };

  const statusStyle = (status) => {
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

  const navigateWeek = (dir) => {
    const next = new Date(currentWeek);
    next.setDate(currentWeek.getDate() + dir * 7);
    setCurrentWeek(next);
  };

  return (
    <div className="h-full w-full overflow-x-auto min-h-0">
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
              {weekDays[0].toLocaleDateString()} –{" "}
              {weekDays[6].toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>

        <div className="w-64">
          <Select
            label="Doctor"
            value={activeDoctorId || "all"}
            onChange={(v) => onDoctorChange(v === "all" ? null : v)}
            options={[
              { value: "all", label: "Choose a doctor" },
              ...doctors.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />
        </div>
      </div>

      {!activeDoctorId ? (
        <div className="p-6 text-sm text-text-secondary">
          <Icon name="Info" className="inline mr-2" /> Choose a doctor to view
          schedule
        </div>
      ) : (
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

            {scheduleLoading ? (
              <div className="p-6 text-sm text-text-secondary">
                Loading schedule…
              </div>
            ) : (
              <div className="divide-y">
                {HOURS.map((time) => (
                  <div key={time} className="grid grid-cols-8 min-h-[56px]">
                    <div className="flex items-center border-r bg-muted p-3 text-sm text-text-secondary">
                      {time}
                    </div>
                    {weekDays.map((day, di) => {
                      const iso = day.toISOString().slice(0, 10);
                      const status = getSlotStatus(iso, time);
                      return (
                        <div key={di} className="border-l p-1">
                          <div
                            className={`rounded border p-2 text-xs text-center ${statusStyle(
                              status
                            )} ${
                              status === "available" ? "cursor-pointer" : ""
                            }`}
                            title={`${iso} ${time} – ${status}`}
                            onClick={() => {
                              if (status !== "available") return;
                              const doc = doctors.find(
                                (d) => d.id === activeDoctorId
                              );
                              onSlotSelect?.({
                                doctorId: activeDoctorId,
                                doctor: {
                                  name: doc?.name,
                                  department: doc?.department,
                                },
                                date: iso,
                                time,
                              });
                            }}>
                            {status === "available"
                              ? "Available"
                              : status === "booked"
                              ? "Booked"
                              : "Blocked"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
