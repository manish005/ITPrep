"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import questionsData from "./questions.json";
const questions = questionsData as any[];

export default function Home() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let result = questions as any[];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((qItem: any) => qItem.question.toLowerCase().includes(q));
    }
    if (filter !== "all") {
      result = result.filter((item: any) => {
        const num = item.id;
        if (filter === "angular-core") return num <= 50;
        if (filter === "directives") return num > 50 && num <= 100;
        if (filter === "rxjs") return num > 100 && num <= 150;
        if (filter === "testing") return num > 150 && num <= 200;
        if (filter === "advanced") return num > 200;
        return true;
      });
    }
    return result;
  }, [search, filter]);

  return (
    <main className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center pt-12 pb-6"
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold gradient-text mb-3"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          ⚡ Angular Interview Prep
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 max-w-2xl mx-auto px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Master {filtered.length} core questions with Framer Motion powered cards.
          Click any card to reveal the answer.
        </motion.p>
      </motion.div>

      <motion.div
        className="max-w-6xl mx-auto px-4 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input pl-12"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {[
              { key: "all", label: "All" },
              { key: "angular-core", label: "Core" },
              { key: "directives", label: "Directives" },
              { key: "rxjs", label: "RxJS" },
              { key: "testing", label: "Testing" },
              { key: "advanced", label: "Advanced" },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                className={`filter-btn ${filter === btn.key ? "active" : ""}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((item: any, index: number) => (
              <QuestionCard
                key={item.id}
                item={item}
                index={index}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No questions found. Try a different search.</p>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}

function QuestionCard({ item, index, expanded, onToggle }: { item: any; index: number; expanded: boolean; onToggle: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.6) }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-6 cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          Q{item.id}
        </span>
        {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </div>
      <h3 className="font-semibold text-base text-gray-800 mb-3 leading-snug">
        {item.question}
      </h3>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {item.answer.replace(/\*\*/g, "").replace(/`/g, "")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}