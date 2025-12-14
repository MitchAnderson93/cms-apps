import React from "react";
import ReactDOM from "react-dom/client";
import { Sidenav } from "@repo/ui";

// Config injected at build time
declare const __APP_CONFIG__: any;

function App() {
  const config = __APP_CONFIG__ || {};
  const nav = config.navigation || {};
  const sidenavEnabled = nav.enabled === true;
  
  // Debug: {config.appName} v{config.version}
  
  if (!sidenavEnabled) {
    // Full width layout without sidenav
    return (
      <div className="row">
        <div className="col-12">
          {/* Debug: {config.appName} v{config.version} */}
        </div>
      </div>
    );
  }
  
  // Column layout with sidenav
  return (
    <div className="row">
      <div className="col-12 col-lg-3 order-lg-first">
        <Sidenav
          collapseTitle={nav.collapseTitle}
          navtitle={nav.navtitle || "Navigation"}
          navtitlelink={nav.navtitlelink}
          navlist={nav.navlist || []}
        />
      </div>
      <div className="col-12 col-lg-9 order-lg-last ps-lg-72">
        {/* Debug: {config.appName} v{config.version} */}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);