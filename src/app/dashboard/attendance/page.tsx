"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Users,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

type AttendanceStatus = "Present" | "Late" | "Absent";

type AttendanceRecord = {
  id: number;
  name: string;
  date: string;
  status: AttendanceStatus;
};

const initialAttendance: AttendanceRecord[] = [
  {
    id: 1,
    name: "John Smith",
    date: "06 Aug 2026",
    status: "Present",
  },
  {
    id: 2,
    name: "Emma Watson",
    date: "06 Aug 2026",
    status: "Present",
  },
  {
    id: 3,
    name: "David Miller",
    date: "06 Aug 2026",
    status: "Late",
  },
  {
    id: 4,
    name: "Sophia Brown",
    date: "06 Aug 2026",
    status: "Absent",
  },
];

export default function AttendancePage() {
  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>(initialAttendance);

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("06 Aug 2026");
  const [showMarkAttendance, setShowMarkAttendance] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<number | null>(null);

  const [selectedStatus, setSelectedStatus] =
    useState<AttendanceStatus>("Present");

  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [attendance, search]);

  const present = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  const late = attendance.filter(
    (item) => item.status === "Late"
  ).length;

  const absent = attendance.filter(
    (item) => item.status === "Absent"
  ).length;

  const attendanceRate =
    attendance.length > 0
      ? Math.round(((present + late) / attendance.length) * 100)
      : 0;

  function handleMarkAttendance() {
    if (!selectedEmployee) {
      return;
    }

    setAttendance((current) =>
      current.map((item) =>
        item.id === selectedEmployee
          ? {
              ...item,
              date: selectedDate,
              status: selectedStatus,
            }
          : item
      )
    );

    setShowMarkAttendance(false);
    setSelectedEmployee(null);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Attendance
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            Daily attendance monitoring and workforce insights.
          </p>
        </div>

        <Button
          onClick={() =>
            setShowMarkAttendance((current) => !current)
          }
        >
          Mark Attendance
        </Button>
      </div>

      {/* Mark Attendance Panel */}
      {showMarkAttendance && (
        <Card className="border-blue-200 bg-blue-50">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Mark Attendance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select an employee and update their attendance status.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {/* Employee */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Employee
                </label>

                <select
                  value={selectedEmployee ?? ""}
                  onChange={(e) =>
                    setSelectedEmployee(
                      e.target.value
                        ? Number(e.target.value)
                        : null
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select employee
                  </option>

                  {attendance.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date
                </label>

                <Input
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(e.target.value)
                  }
                  placeholder="06 Aug 2026"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value as AttendanceStatus
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Present">
                    Present
                  </option>

                  <option value="Late">
                    Late
                  </option>

                  <option value="Absent">
                    Absent
                  </option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleMarkAttendance}
                disabled={!selectedEmployee}
              >
                Save Attendance
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  setShowMarkAttendance(false)
                }
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card>
        <div className="flex items-center gap-3">
          <Search className="text-slate-400" />

          <Input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none bg-transparent shadow-none focus:ring-0"
          />
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
            <CheckCircle
              className="text-green-600"
              size={28}
            />
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Present
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {present}
          </h2>

          <p className="mt-3 text-sm text-green-600">
            Employees Present
          </p>
        </Card>

        <Card className="transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
            <Clock
              className="text-yellow-600"
              size={28}
            />
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Late
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {late}
          </h2>

          <p className="mt-3 text-sm text-yellow-600">
            Arrived Late
          </p>
        </Card>

        <Card className="transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
            <XCircle
              className="text-red-600"
              size={28}
            />
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Absent
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {absent}
          </h2>

          <p className="mt-3 text-sm text-red-600">
            Employees Absent
          </p>
        </Card>

        <Card className="transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
            <Users
              className="text-blue-600"
              size={28}
            />
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Attendance Rate
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {attendanceRate}%
          </h2>

          <p className="mt-3 text-sm text-blue-600">
            Current Workforce Rate
          </p>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Attendance Records
            </h2>

            <p className="text-sm text-slate-500">
              Daily workforce attendance
            </p>
          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <CalendarDays size={16} />
            {selectedDate}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-5 text-left text-sm font-semibold text-slate-600">
                  Employee
                </th>

                <th className="p-5 text-left text-sm font-semibold text-slate-600">
                  Date
                </th>

                <th className="p-5 text-left text-sm font-semibold text-slate-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t transition hover:bg-slate-50"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar name={item.name} />

                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            Employee ID #{item.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CalendarDays size={16} />
                        {item.date}
                      </div>
                    </td>

                    <td className="p-5">
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          item.status === "Present"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Late"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    <EmptyState title="No Attendance Records" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}