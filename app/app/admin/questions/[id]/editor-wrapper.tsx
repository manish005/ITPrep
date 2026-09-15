"use client";

import { AdminProvider } from "../../AdminContext";
import AdminLayout from "../../AdminLayout";
import QuestionEditorPage from "./page";

export default function QuestionEditorWrapper() {
  return (
    <AdminProvider>
      <AdminLayout>
        <QuestionEditorPage />
      </AdminLayout>
    </AdminProvider>
  );
}
