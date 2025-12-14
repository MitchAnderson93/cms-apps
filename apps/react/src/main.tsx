import React from "react";
import ReactDOM from "react-dom/client";

// Config injected at build time
declare const __APP_CONFIG__: any;

function App() {
  const config = __APP_CONFIG__ || {};
  
  return (
    <div className={config.theme?.customClass || ""}>
      <h2>{config.appName}</h2>
      <p>Version: {config.version}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);