"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "success", isVisible, onClose, duration = 2500 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, duration, onClose]);

  const iconMap = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  const colorMap = {
    success: { bg: "#dcfce7", border: "#86efac", icon: "#16a34a", text: "#166534" },
    error: { bg: "#fee2e2", border: "#fca5a5", icon: "#dc2626", text: "#991b1b" },
    info: { bg: "#dbeafe", border: "#93c5fd", icon: "#2563eb", text: "#1e40af" },
  };

  const colors = colorMap[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "32px 40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
              border: `2px solid ${colors.border}`,
              pointerEvents: "auto",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1, damping: 15, stiffness: 400 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: colors.bg,
                border: `3px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.span
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: colors.icon,
                  lineHeight: 1,
                }}
              >
                {iconMap[type]}
              </motion.span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: colors.text,
                margin: 0,
                textAlign: "center",
              }}
            >
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
