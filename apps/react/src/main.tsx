import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Standard React (Vite) inside Turborepo</h1>
      <p>No Next.js. Next step: add packages/cms-widget for Squiz Git Bridge.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);