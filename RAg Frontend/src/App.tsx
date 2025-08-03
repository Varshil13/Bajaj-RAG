import ChatInterface from "./components/ChatInterface";
import Header from "./components/Header";
import "./App.css";

function App() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      style={{
        height: "100vh",
        background:
          "linear-gradient(to bottom right, #0f172a, #1e293b, #334155)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main
        className="container mx-auto px-4 py-8"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "1rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          className="max-w-4xl mx-auto"
          style={{
            width: "100%",
            maxWidth: "64rem",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div
            className="text-center mb-8"
            style={{
              textAlign: "center",
              marginBottom: "1rem",
              flexShrink: 0,
            }}
          >
            <h1
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#f1f5f9",
                marginBottom: "0.5rem",
              }}
            >
              RAG Assistant
            </h1>
            <p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              style={{
                fontSize: "1rem",
                color: "#cbd5e1",
                maxWidth: "42rem",
                margin: "0 auto",
              }}
            >
              Ask questions and get intelligent responses powered by
              retrieval-augmented generation.
            </p>
          </div>
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}

export default App;
