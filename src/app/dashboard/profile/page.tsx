"use client";

import {
  User,
  Mail,
  Shield,
  Building2,
  CheckCircle2,
  Lock,
  Camera,
  Pencil,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
            <User className="text-blue-600" size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Profile
            </h1>

            <p className="mt-1 text-slate-500">
              Manage your personal information and account security.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Hero */}
      <Card className="overflow-hidden p-0">
        <div className="h-32 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600" />

        <div className="px-6 pb-7 md:px-8">
          <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <div className="relative">
                <Avatar
                  name="Admin User"
                  className="h-24 w-24 border-4 border-white bg-white text-3xl shadow-xl"
                />

                <button
                  type="button"
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
                  aria-label="Change profile photo"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Admin User
                  </h2>

                  <CheckCircle2
                    size={19}
                    className="text-blue-600"
                    fill="currentColor"
                  />
                </div>

                <p className="mt-1 text-slate-500">
                  Super Administrator
                </p>
              </div>
            </div>

            <Button variant="secondary" className="gap-2">
              <Pencil size={17} />
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Overview */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Account Overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your current account and organization details.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Email */}
        <Card className="group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
              <Mail className="text-blue-600" size={23} />
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Verified
            </span>
          </div>

          <p className="mt-5 text-sm text-slate-500">Email address</p>

          <p className="mt-1 break-all font-semibold text-slate-900">
            admin@example.com
          </p>
        </Card>

        {/* Role */}
        <Card className="group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
            <Shield className="text-green-600" size={23} />
          </div>

          <p className="mt-5 text-sm text-slate-500">Account role</p>

          <p className="mt-1 font-semibold text-slate-900">
            Super Administrator
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Full access to organization settings
          </p>
        </Card>

        {/* Organization */}
        <Card className="group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
            <Building2 className="text-purple-600" size={23} />
          </div>

          <p className="mt-5 text-sm text-slate-500">Organization</p>

          <p className="mt-1 font-semibold text-slate-900">
            Acme Corporation
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Primary organization
          </p>
        </Card>

        {/* Status */}
        <Card className="group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
            <User className="text-orange-500" size={23} />
          </div>

          <p className="mt-5 text-sm text-slate-500">Account status</p>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <p className="font-semibold text-green-600">Active</p>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Your account is in good standing
          </p>
        </Card>
      </div>

      {/* Security */}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Lock className="text-slate-700" size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Security
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep your account protected.
              </p>
            </div>
          </div>

          <Button variant="secondary">
            Change Password
          </Button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 md:p-7">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              Password
            </p>

            <p className="mt-2 font-semibold tracking-widest text-slate-900">
              ••••••••••••
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Last changed recently
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={18}
                className="text-green-600"
              />

              <p className="font-semibold text-green-800">
                Account protected
              </p>
            </div>

            <p className="mt-2 text-sm text-green-700">
              Your account security is currently active.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}