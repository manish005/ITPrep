"use client";

import { AdminProvider } from "./AdminContext";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    </AdminProvider>
  );
}
