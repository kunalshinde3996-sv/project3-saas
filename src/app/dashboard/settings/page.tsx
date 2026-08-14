"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Globe,
  Save,
  CheckCircle2,
  CreditCard,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function SettingsPage() {
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@demo.com");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
            <Globe className="text-blue-600" size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Settings
            </h1>

            <p className="mt-1 text-slate-500">
              Manage your account, security and application preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Saved message */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800 shadow-sm">
          <CheckCircle2 size={20} />
          <div>
            <p className="font-semibold">Changes saved</p>
            <p className="text-sm text-green-700">
              Your preferences have been updated for this session.
            </p>
          </div>
        </div>
      )}

      {/* Profile */}
      <Card className="p-6 transition-all duration-300 hover:shadow-lg md:p-8">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
            <User className="text-blue-600" size={23} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Profile
            </h2>

            <p className="text-sm text-slate-500">
              Update your personal account information.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="full-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Full Name
            </label>

            <Input
              id="full-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6 transition-all duration-300 hover:shadow-lg md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
              <ShieldCheck className="text-green-600" size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Security
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Protect your account and manage your password.
              </p>
            </div>
          </div>

          <Button variant="secondary" className="gap-2">
            <Lock size={17} />
            Change Password
          </Button>
        </div>

        <div className="mt-6 rounded-2xl bg-green-50 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />

            <p className="font-semibold text-green-800">
              Your account is secure
            </p>
          </div>

          <p className="mt-1 text-sm text-green-700">
            No security issues have been detected.
          </p>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 transition-all duration-300 hover:shadow-lg md:p-8">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
            <Bell className="text-orange-500" size={23} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Notifications
            </h2>

            <p className="text-sm text-slate-500">
              Choose which notifications you want to receive.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {/* Email */}
          <div className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="font-semibold text-slate-900">
                Email Notifications
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Receive important updates and account notifications.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setEmailNotifications(!emailNotifications)
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                emailNotifications
                  ? "bg-blue-600"
                  : "bg-slate-300"
              }`}
              aria-label="Toggle email notifications"
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  emailNotifications
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* System alerts */}
          <div className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="font-semibold text-slate-900">
                System Alerts
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Get notified about important system events.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSystemAlerts(!systemAlerts)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                systemAlerts
                  ? "bg-blue-600"
                  : "bg-slate-300"
              }`}
              aria-label="Toggle system alerts"
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  systemAlerts
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6 transition-all duration-300 hover:shadow-lg md:p-8">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
            <Globe className="text-purple-600" size={23} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Preferences
            </h2>

            <p className="text-sm text-slate-500">
              Customize your dashboard experience.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="language"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Language
            </label>

            <select
              id="language"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              defaultValue="English"
            >
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Timezone
            </label>

            <select
              id="timezone"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              defaultValue="UTC+05:30"
            >
              <option>UTC+05:30</option>
              <option>UTC</option>
              <option>UTC-05:00</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Plan / Upgrade */}
      <Card className="overflow-hidden p-0">
        <div className="bg-linear-to-r from-indigo-600 via-blue-600 to-cyan-600 p-7 text-white md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Sparkles size={23} />
              </div>

              <div>
                <p className="text-sm font-medium text-blue-100">
                  Current Plan
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Pro Plan
                </h2>

                <p className="mt-2 max-w-xl text-sm text-blue-100">
                  Your organization has access to advanced analytics,
                  reports and premium dashboard features.
                </p>
              </div>
            </div>

            <Button className="shrink-0 bg-white text-blue-600 hover:bg-blue-50">
              <CreditCard size={17} />
              Manage Plan
            </Button>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3 md:p-7">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Advanced Analytics
            </p>

            <p className="mt-2 font-semibold text-green-600">
              Enabled
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Dashboard Builder
            </p>

            <p className="mt-2 font-semibold text-green-600">
              Enabled
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Premium Reports
            </p>

            <p className="mt-2 font-semibold text-green-600">
              Enabled
            </p>
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="gap-2 px-6 shadow-md hover:shadow-lg"
        >
          <Save size={18} />
          Save Changes
        </Button>
      </div>
    </div>
  );
}