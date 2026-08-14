"use client";

import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  CalendarDays,
  Download,
  BarChart3,
} from "lucide-react";

const reports = [
  {
    month: "January",
    employees: 210,
    revenue: "$72K",
    growth: "12%",
  },
  {
    month: "February",
    employees: 220,
    revenue: "$75K",
    growth: "14%",
  },
  {
    month: "March",
    employees: 228,
    revenue: "$78K",
    growth: "16%",
  },
  {
    month: "April",
    employees: 245,
    revenue: "$82K",
    growth: "18%",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Business Reports
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor business growth, revenue and workforce performance.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Statistics */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
            <Users className="text-blue-600" size={28} />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Employees
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            245
          </h2>

          <p className="mt-3 text-green-600 text-sm">
            +8 this month
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
            <DollarSign className="text-green-600" size={28} />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Revenue
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            $82K
          </h2>

          <p className="mt-3 text-green-600 text-sm">
            +18% Growth
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
            <TrendingUp className="text-orange-600" size={28} />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Growth
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            18%
          </h2>

          <p className="mt-3 text-orange-600 text-sm">
            Highest this year
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
            <Activity className="text-purple-600" size={28} />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Performance
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            95%
          </h2>

          <p className="mt-3 text-purple-600 text-sm">
            Excellent
          </p>
        </div>
      </div>

      {/* Middle Section */}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Performance */}

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <BarChart3 className="text-blue-600" />
            <h2 className="text-2xl font-bold">
              Performance Overview
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>Employee Productivity</span>
                <span>95%</span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[95%] rounded-full bg-blue-600"></div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>Payroll Processing</span>
                <span>88%</span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[88%] rounded-full bg-green-600"></div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>Attendance Rate</span>
                <span>92%</span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[92%] rounded-full bg-orange-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary */}

        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold">
            Business Summary
          </h2>

          <p className="mt-3 text-blue-100">
            Your organization continues to grow steadily with excellent workforce performance.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-sm text-blue-100">
                Revenue
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                $82,000
              </h3>
            </div>

            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-sm text-blue-100">
                Workforce
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                245 Employees
              </h3>
            </div>

            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-sm text-blue-100">
                Annual Growth
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                +18%
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Reports */}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-2xl font-bold">
            Monthly Report
          </h2>
        </div>

        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-5 text-left">
                Month
              </th>

              <th className="p-5 text-left">
                Employees
              </th>

              <th className="p-5 text-left">
                Revenue
              </th>

              <th className="p-5 text-left">
                Growth
              </th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr
                key={report.month}
                className="border-t transition hover:bg-slate-50"
              >
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={18}
                      className="text-blue-600"
                    />

                    {report.month}
                  </div>
                </td>

                <td className="p-5 font-semibold">
                  {report.employees}
                </td>

                <td className="p-5 font-bold text-green-600">
                  {report.revenue}
                </td>

                <td className="p-5">
                  <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                    {report.growth}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}