"use client";

import { AdminProvider } from "../AdminContext";
import AdminLayout from "../AdminLayout";
import CategoryManager from "../CategoryManager";

export default function CategoriesPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <CategoryManager />
      </AdminLayout>
    </AdminProvider>
  );
}
