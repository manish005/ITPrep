"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Modal } from "./components/Modal";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { getQuestions, getCategories } from "./data/storage";
import AnswerRenderer from "./admin/AnswerRenderer";

export default function Home() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalQuestion, setModalQuestion] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [questionsData, setQuestionsData] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    setQuestionsData(getQuestions());
    setCategoriesData(getCategories());
  }, []);

  const filtered = useMemo(() => {
    let result = questionsData
      .filter((q) => q.status === "published")
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) => item.title.toLowerCase().includes(q));
    }
    if (filter !== "all") {
      result = result.filter((item) => item.categoryId === filter);
    }
    return result;
  }, [search, filter, questionsData]);

  const getCategoryName = (catId: string) => categoriesData.find((c) => c.id === catId)?.name || "";

  const handleCheckAnswer = (item: any) => {
    setModalQuestion(item);
    setModalOpen(true);
  };

  return (
    <div className="app-layout">
      <Sidebar activeItem="angular" onItemClick={() => {}} />
      <div className="main-area">
        <TopNav searchQuery={search} onSearchChange={setSearch} />
        <main className="content-area">
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
              Click "Check Answer" to reveal the answer in a modal.
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
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setFilter("all")}
                  className={`filter-btn ${filter === "all" ? "active" : ""}`}
                >
                  All
                </button>
                {categoriesData.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`filter-btn ${filter === cat.id ? "active" : ""}`}
                  >
                    {cat.icon} {cat.name}
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
                {filtered.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.6) }}
                    whileHover={{ scale: 1.02 }}
                    className="glass-card p-6 cursor-default"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        Q{item.order}
                      </span>
                      <span className="text-xs text-gray-400">{getCategoryName(item.categoryId)}</span>
                    </div>
                    <h3 className="font-semibold text-base text-gray-800 mb-4 leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {item.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleCheckAnswer(item)}
                      className="check-answer-btn"
                    >
                      Check Answer
                    </button>
                  </motion.div>
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

          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
            {modalQuestion && (
              <div className="modal-body">
                <div className="modal-meta">
                  <span className="modal-category">{getCategoryName(modalQuestion.categoryId)}</span>
                  <span className={`modal-difficulty ${modalQuestion.difficulty}`}>
                    {modalQuestion.difficulty}
                  </span>
                </div>
                <h2 className="modal-question-text">{modalQuestion.title}</h2>
                <div className="modal-answer">
                  {modalQuestion.answer?.blocks && modalQuestion.answer.blocks.length > 0 ? (
                    <AnswerRenderer blocks={modalQuestion.answer.blocks} />
                  ) : (
                    <p className="no-answer">No answer available for this question.</p>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </main>
      </div>

      <style jsx>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }
        .main-area {
          flex: 1;
          margin-left: 260px;
        }
        .content-area {
          padding: 0 32px 32px;
        }
        .search-input {
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #E4ECFC;
          border-radius: 12px;
          padding: 12px 20px;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
        }
        .search-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
        .filter-btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 2px solid #E4ECFC;
          background: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 13px;
        }
        .filter-btn:hover {
          border-color: #2563EB;
          background: rgba(37, 99, 235, 0.05);
        }
        .filter-btn.active {
          background: #2563EB;
          color: white;
          border-color: #2563EB;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid #E4ECFC;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(37, 99, 235, 0.08);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(37, 99, 235, 0.15);
          border-color: #2563EB;
        }
        .check-answer-btn {
          width: 100%;
          padding: 10px 16px;
          background: linear-gradient(135deg, #2563EB, #7C3AED);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .check-answer-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .gradient-text {
          background: linear-gradient(135deg, #2563EB, #7C3AED);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .modal-body {
          padding-right: 16px;
        }
        .modal-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .modal-category {
          background: #e0e7ff;
          color: #3730a3;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        .modal-difficulty {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .modal-difficulty.easy { background: #dcfce7; color: #166534; }
        .modal-difficulty.medium { background: #fef3c7; color: #92400e; }
        .modal-difficulty.hard { background: #fee2e2; color: #991b1b; }
        .modal-question-text {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .modal-answer {
          line-height: 1.8;
          color: #334155;
        }
        .no-answer {
          text-align: center;
          color: #94a3b8;
          padding: 40px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
