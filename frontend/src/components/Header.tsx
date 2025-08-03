import React from "react";
import { Brain, MessageCircle } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header
      className="bg-white shadow-sm border-b border-gray-200"
      style={{
        backgroundColor: "#1e293b",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.3)",
        borderBottom: "1px solid #334155",
        flexShrink: 0,
      }}
    >
      <div
        className="container mx-auto px-4 py-4"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0.75rem 1rem",
        }}
      >
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-3"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2rem",
                height: "2rem",
                backgroundColor: "#3b82f6",
                borderRadius: "0.5rem",
              }}
            >
              <Brain
                className="w-6 h-6 text-white"
                style={{ color: "white", width: "1.25rem", height: "1.25rem" }}
              />
            </div>
            <div>
              <h1
                className="text-xl font-bold text-gray-900"
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "#f1f5f9",
                }}
              >
                RAG Assistant
              </h1>
              <p
                className="text-sm text-gray-600"
                style={{
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                }}
              >
                Intelligent Question Answering
              </p>
            </div>
          </div>
          <div
            className="flex items-center space-x-2 text-sm text-gray-600"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              color: "#cbd5e1",
            }}
          ></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
