import React from "react";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function ChatHistoryToggle({ isOpen, onToggle, className = "" }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className={`
        fixed top-4 left-4 z-40 p-3 rounded-lg bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 shadow-lg 
        hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        transition-all duration-200 ${className}
        lg:relative lg:top-0 lg:left-0 lg:z-auto
      `}
            aria-label={isOpen ? "Close chat history" : "Open chat history"}
            aria-expanded={isOpen}
        >
            <motion.div
                initial={false}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
            >
                {isOpen ? (
                    <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                ) : (
                    <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                )}
            </motion.div>
        </motion.button>
    );
} 