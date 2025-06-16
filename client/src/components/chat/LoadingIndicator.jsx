import React from "react";
import { Bot, Loader2 } from "lucide-react";

export function LoadingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-neutral-800 text-white border border-neutral-400 flex items-center justify-center">
          <img src="/bot-image.png" className="w-5 h-5" />
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Loader2
              size={16}
              className="animate-spin text-gray-500 dark:text-gray-400"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Thinking...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
