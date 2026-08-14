"use client";

import { useMemo, useState } from "react";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Search,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";

type PayrollStatus = "Paid" | "Pending";

type PayrollRecord = {
  id: number;
  employee: string;
  salary: string;
  status: PayrollStatus;
};

const initialPayroll: PayrollRecord[] = [
  {
    id: 1,
    employee: "John Smith",
    salary: "$4,200",
    status: "Paid",
  },
  {
    id: 2,
    employee: "Emma Watson",
    salary: "$3,800",
    status: "Paid",
  },
  {
    id: 3,
    employee: "David Miller",
    salary: "$3,100",
    status: "Pending",
  },
  {
    id: 4,
    employee: "Sophia Brown",
    salary: "$3,600",
    status: "Paid",
  },
];

export default function PayrollPage() {
  const [payroll, setPayroll] =
    useState<PayrollRecord[]>(initialPayroll);

  const [search, setSearch] = useState("");
  const [showProcessPayroll, setShowProcessPayroll] =
    useState(false);

  const filteredPayroll = useMemo(() => {
    return payroll.filter((item) =>
      item.employee.toLowerCase().includes(search.toLowerCase())
    );
  }, [payroll, search]);

  const totalPayroll = payroll.reduce((sum, item) => {
    return (
      sum +
      Number(
        item.salary.replace("$", "").replace(",", "")
      )
    );
  }, 0);

  const paidAmount = payroll
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => {
      return (
        sum +
        Number(
          item.salary.replace("$", "").replace(",", "")
        )
      );
    }, 0);

  const pendingAmount = payroll
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => {
      return (
        sum +
        Number(
          item.salary.replace("$", "").replace(",", "")
        )
      );
    }, 0);

  const paidCount = payroll.filter(
    (item) => item.status === "Paid"
  ).length;

  const successRate =
    payroll.length > 0
      ? Math.round((paidCount / payroll.length) * 100)
      : 0;

  function handleProcessPayroll() {
    setPayroll((current) =>
      current.map((item) => ({
        ...item,
        status: "Paid",
      }))
    );

    setShowProcessPayroll(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Payroll
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            Monitor salary distribution and payment status.
          </p>
        </div>

        <Button
          onClick={() =>
            setShowProcessPayroll((current) => !current)
          }
        >
          Process Payroll
        </Button>
      </div>

      {/* Process Payroll Panel */}
      {showProcessPayroll && (
        <Card className="border-blue-200 bg-blue-50">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Process Payroll
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Process all pending employee salaries for this
                payroll cycle.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4">
                <p className="text-sm text-slate-500">
                  Pending Employees
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {payroll.filter(
                    (item) => item.status === "Pending"
                  ).length}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-sm text-slate-500">
                  Pending Amount
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-600">
                  ${pendingAmount.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-sm text-slate-500">
                  Payroll Total
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-600">
                  ${totalPayroll.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleProcessPayroll}
                disabled={pendingAmount === 0}
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={18} />
                Confirm Payroll
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  setShowProcessPayroll(false)
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee..."
            className="border-none bg-transparent shadow-none focus:ring-0"
          />
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
            <Wallet
              className="text-blue-600"
              size={28}
            />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Total Payroll
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            ${totalPayroll.toLocaleString()}
          </h2>

          <p className="mt-3 text-sm text-blue-600">
            Current payroll cycle
          </p>
        </Card>

        <Card className="transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
            <DollarSign
              className="text-green-600"
              size={28}
            />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Paid
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            ${paidAmount.toLocaleString()}
          </h2>

          <p className="mt-3 text-sm text-green-600">
            Successfully processed
          </p>
        </Card>

        <Card className="transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
            <TrendingUp
              className="text-orange-600"
              size={28}
            />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Pending
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            ${pendingAmount.toLocaleString()}
          </h2>

          <p className="mt-3 text-sm text-orange-600">
            Awaiting processing
          </p>
        </Card>

        <Card className="transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
            <CreditCard
              className="text-purple-600"
              size={28}
            />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Success Rate
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {successRate}%
          </h2>

          <p className="mt-3 text-sm text-purple-600">
            Payroll completion rate
          </p>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Payroll Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Employee salary and payment information.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-5 text-left text-sm font-semibold text-slate-600">
                  Employee
                </th>

                <th className="p-5 text-left text-sm font-semibold text-slate-600">
                  Salary
                </th>

                <th className="p-5 text-left text-sm font-semibold text-slate-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPayroll.length > 0 ? (
                filteredPayroll.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t transition hover:bg-slate-50"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar
                          name={item.employee}
                          className="h-11 w-11"
                        />

                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.employee}
                          </p>

                          <p className="text-sm text-slate-500">
                            Employee ID #{item.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <span className="text-lg font-bold text-green-600">
                        {item.salary}
                      </span>
                    </td>

                    <td className="p-5">
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          item.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
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
                    <EmptyState title="No Payroll Records" />
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