"use client";

import { AdminProvider } from "../AdminContext";
import AdminLayout from "../AdminLayout";
import QuestionManager from "../QuestionManager";

export default function QuestionsPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <QuestionManager />
      </AdminLayout>
    </AdminProvider>
  );
}
