import { ModeToggle } from "@/components/mode-toggle";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex items-center justify-between w-full max-w-4xl px-4 py-6 text-gray-800 dark:text-gray-100">
        <ModeToggle />
      </div>

      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        DevOps AI Agent
        <span className="text-blue-500 dark:text-blue-400">
          {" "}
          - Your AI-powered DevOps Assistant
        </span>
      </h1>
    </div>
  );
};

export default page;
