import React from "react";
import ReactDOM from "react-dom/client";
// @ts-ignore
import appConfig from "@config/example.json";

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>{appConfig.appName}</h1>
      <p>Version: {appConfig.version}</p>
      <p>Custom Class: {appConfig.theme.customClass || "None"}</p>
      <p>Config loaded from: {import.meta.env.APP_CONFIG}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);