import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot, AlertCircle } from "lucide-react";
import axios from "axios";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: "chat" | "claim";
  claimResult?: ClaimResult;
}

interface ClaimResult {
  Decision: string;
  Amount?: number;
  Justification: string;
}

interface ChatApiResponse {
  success: boolean;
  answer: string;
  structured_response?: ClaimResult;
  error?: string;
  message?: string;
}

interface ClaimApiResponse {
  success: boolean;
  result: ClaimResult;
  raw_response: string;
  error?: string;
  message?: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: 'Hello! I\'m your Insurance RAG assistant. Ask me general questions about the Easy Health Policy, or provide claim details for evaluation (e.g., "46M, knee surgery, Pune, 3-month policy").',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to detect if input looks like a claim (has age, gender, procedure pattern)
  const isClaimQuery = (text: string): boolean => {
    const claimPattern = /\d+[MF]/i; // Pattern like "46M" or "25F"
    return (
      claimPattern.test(text) &&
      (text.toLowerCase().includes("surgery") ||
        text.toLowerCase().includes("treatment") ||
        text.toLowerCase().includes("procedure") ||
        text.toLowerCase().includes("operation"))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const queryText = inputText;
    setInputText("");
    setIsLoading(true);
    setError(null);

    try {
      let response;
      let messageType: "chat" | "claim" = "chat";

      // Determine if this should be a claim evaluation or general chat
      if (isClaimQuery(queryText)) {
        messageType = "claim";
        response = await axios.post<ClaimApiResponse>(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/hackrx/run`,
          {
            customQuery: queryText,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );
      } else {
        response = await axios.post<ChatApiResponse>(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
          {
            message: queryText,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );
      }

      if (!response.data.success) {
        throw new Error(response.data.error || "API request failed");
      }

      let responseText = "";
      let claimResult: ClaimResult | undefined;

      if (messageType === "claim") {
        const claimData = response.data as ClaimApiResponse;
        claimResult = claimData.result;
        responseText = `**Claim Decision: ${claimResult.Decision}**\n\n`;
        if (claimResult.Amount) {
          responseText += `**Amount: ₹${claimResult.Amount.toLocaleString()}**\n\n`;
        }
        responseText += `**Justification:**\n${claimResult.Justification}`;
      } else {
        const chatData = response.data as ChatApiResponse;
        responseText = chatData.answer;

        // Check if there's a structured response (in case chat response contains claim info)
        if (chatData.structured_response) {
          claimResult = chatData.structured_response;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
        type: messageType,
        claimResult: claimResult,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Error calling RAG API:", err);
      let errorMessage =
        "Sorry, I encountered an error while processing your request.";

      if (err.code === "ECONNREFUSED") {
        errorMessage =
          "Unable to connect to the RAG server. Please make sure your backend is running on localhost:3001.";
      } else if (err.response?.status === 404) {
        errorMessage =
          "The API endpoint was not found. Please check your RAG backend configuration.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);

      const errorResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const [backendHealth, setBackendHealth] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/health`,
          {
            timeout: 5000,
          }
        );
        setBackendHealth(
          response.status === 200 ? "connected" : "disconnected"
        );
      } catch (error) {
        setBackendHealth("disconnected");
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      style={{
        backgroundColor: "#1e293b",
        borderRadius: "0.75rem",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
        border: "1px solid #334155",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Chat Messages */}
      <div
        className="h-96 overflow-y-auto p-6 space-y-4"
        style={{
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          backgroundColor: "#0f172a",
          flex: 1,
          minHeight: 0,
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 animate-slide-up ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              justifyContent: message.isUser ? "flex-end" : "flex-start",
            }}
          >
            {!message.isUser && (
              <div
                className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center"
                style={{
                  flexShrink: 0,
                  width: "2rem",
                  height: "2rem",
                  backgroundColor: "#3b82f6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot
                  className="w-4 h-4 text-white"
                  style={{ color: "white" }}
                />
              </div>
            )}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.isUser
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
              style={{
                maxWidth: message.isUser ? "18rem" : "28rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: message.isUser ? "#3b82f6" : "#334155",
                color: message.isUser ? "white" : "#e2e8f0",
              }}
            >
              {/* Special rendering for claim results */}
              {!message.isUser && message.claimResult ? (
                <div className="space-y-3">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      message.claimResult.Decision?.toLowerCase() === "approved"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                    style={{
                      backgroundColor:
                        message.claimResult.Decision?.toLowerCase() ===
                        "approved"
                          ? "#dcfce7"
                          : "#fef2f2",
                      color:
                        message.claimResult.Decision?.toLowerCase() ===
                        "approved"
                          ? "#166534"
                          : "#dc2626",
                      border: `1px solid ${
                        message.claimResult.Decision?.toLowerCase() ===
                        "approved"
                          ? "#bbf7d0"
                          : "#fecaca"
                      }`,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                    }}
                  >
                    🏥 Claim {message.claimResult.Decision}
                  </div>

                  {message.claimResult.Amount && (
                    <div
                      className="bg-blue-50 p-3 rounded-lg border border-blue-200"
                      style={{
                        backgroundColor: "#1e40af20",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #3b82f6",
                      }}
                    >
                      <div
                        className="text-sm font-medium text-blue-900"
                        style={{ color: "#60a5fa", fontWeight: "500" }}
                      >
                        💰 Coverage Amount
                      </div>
                      <div
                        className="text-lg font-bold text-blue-800"
                        style={{
                          color: "#93c5fd",
                          fontSize: "1.125rem",
                          fontWeight: "bold",
                        }}
                      >
                        ₹{message.claimResult.Amount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div
                      className="text-sm font-medium"
                      style={{ fontWeight: "500", color: "#cbd5e1" }}
                    >
                      📋 Justification:
                    </div>
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {message.claimResult.Justification}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.text}
                </div>
              )}

              <p
                className={`text-xs mt-2 ${
                  message.isUser ? "text-primary-100" : "text-gray-500"
                }`}
                style={{
                  fontSize: "0.625rem",
                  marginTop: "0.5rem",
                  color: message.isUser ? "#dbeafe" : "#94a3b8",
                }}
              >
                {message.timestamp.toLocaleTimeString()}
                {!message.isUser && message.type === "claim" && (
                  <span
                    className="ml-2 px-2 py-0.5 bg-blue-500 text-white rounded text-xs"
                    style={{
                      marginLeft: "0.5rem",
                      padding: "0.125rem 0.5rem",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      borderRadius: "0.25rem",
                      fontSize: "0.625rem",
                    }}
                  >
                    Claim Analysis
                  </span>
                )}
              </p>
            </div>
            {message.isUser && (
              <div
                className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center"
                style={{
                  flexShrink: 0,
                  width: "2rem",
                  height: "2rem",
                  backgroundColor: "#475569",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User
                  className="w-4 h-4 text-white"
                  style={{ color: "white" }}
                />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div
            className="flex items-start space-x-3 justify-start animate-slide-up"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              justifyContent: "flex-start",
            }}
          >
            <div
              className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center"
              style={{
                flexShrink: 0,
                width: "2rem",
                height: "2rem",
                backgroundColor: "#3b82f6",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot className="w-4 h-4 text-white" style={{ color: "white" }} />
            </div>
            <div
              className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg"
              style={{
                backgroundColor: "#334155",
                color: "#e2e8f0",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
              }}
            >
              <div
                className="flex items-center space-x-2"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Loader2
                  className="w-4 h-4 animate-spin"
                  style={{ color: "#3b82f6" }}
                />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div
          className="px-6 py-3 bg-red-50 border-t border-red-200"
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#7f1d1d",
            borderTop: "1px solid #991b1b",
          }}
        >
          <div
            className="flex items-center space-x-2 text-red-700"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#fecaca",
            }}
          >
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div
        className="border-t border-gray-200 p-4"
        style={{
          borderTop: "1px solid #334155",
          padding: "0.75rem",
          backgroundColor: "#1e293b",
          flexShrink: 0,
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex space-x-3"
          style={{
            display: "flex",
            gap: "0.75rem",
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about policy coverage or enter claim details."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              border: "1px solid #475569",
              borderRadius: "0.5rem",
              outline: "none",
              fontSize: "0.875rem",
              backgroundColor: "#334155",
              color: "#e2e8f0",
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor:
                !inputText.trim() || isLoading ? "#475569" : "#3b82f6",
              color: "white",
              borderRadius: "0.5rem",
              border: "none",
              cursor:
                !inputText.trim() || isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Send</span>
          </button>
        </form>
        <div className="mt-2 space-y-1">
          <p
            className={`text-xs mt-1 ${
              backendHealth === "connected"
                ? "text-green-500"
                : backendHealth === "disconnected"
                ? "text-red-500"
                : "text-yellow-500"
            }`}
            style={{
              fontSize: "0.625rem",
              color:
                backendHealth === "connected"
                  ? "#22c55e"
                  : backendHealth === "disconnected"
                  ? "#ef4444"
                  : "#eab308",
              marginTop: "0.25rem",
            }}
          >
            {backendHealth === "connected" && "🟢 Connected to RAG Backend"}
            {backendHealth === "disconnected" &&
              "🔴 Disconnected from RAG Backend"}
            {backendHealth === "checking" &&
              "🟡 Checking RAG Backend connection..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
