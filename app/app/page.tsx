"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Modal } from "./components/Modal";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { getQuestions, getCategories } from "./data/storage";
import AnswerRenderer from "./admin/AnswerRenderer";

function getChildCategoryIds(categories: any[], parentId: string): string[] {
  const children = categories.filter((c) => c.parentId === parentId);
  let ids: string[] = [parentId];
  for (const child of children) {
    ids = ids.concat(getChildCategoryIds(categories, child.id));
  }
  return ids;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalQuestion, setModalQuestion] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [questionsData, setQuestionsData] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setQuestionsData(getQuestions());
    setCategoriesData(getCategories());
  }, []);

  const handleFilterChange = (item: string) => {
    setFilter(item);
    setMobileMenuOpen(false);
  };

  const filtered = useMemo(() => {
    let result = questionsData
      .filter((q) => q.status === "published")
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) => item.title.toLowerCase().includes(q));
    }

    if (filter !== "all") {
      const filterIds = getChildCategoryIds(categoriesData, filter);
      result = result.filter((item) => filterIds.includes(item.categoryId));
    }

    return result;
  }, [search, filter, questionsData, categoriesData]);

  const getCategoryName = (catId: string) => categoriesData.find((c) => c.id === catId)?.name || "";

  const getPageTitle = () => {
    if (filter === "all") return "All Questions";
    const cat = categoriesData.find((c) => c.id === filter);
    return cat ? `${cat.name} Prep` : "Questions";
  };

  const handleCheckAnswer = (item: any) => {
    setModalQuestion(item);
    setModalOpen(true);
  };

  return (
    <div className="app-layout">
      <Sidebar activeItem={filter} onItemClick={handleFilterChange} isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="main-area">
        <TopNav searchQuery={search} onSearchChange={setSearch} onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="content-area">
          <motion.div
            className="max-w-6xl mx-auto pb-8"
            style={{ marginTop: 100 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.h1
              key={filter}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl md:text-4xl font-bold gradient-text mb-6"
            >
              {getPageTitle()}
            </motion.h1>

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
    </div>
  );
}
