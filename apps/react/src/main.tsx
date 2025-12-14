import React from "react";
import ReactDOM from "react-dom/client";
import { Sidenav } from "@repo/ui";

// Config injected at build time
declare const __APP_CONFIG__: any;

function App() {
  const config = __APP_CONFIG__ || {};
  const nav = config.navigation || {};
  
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
          <h2>{config.appName}</h2>
          <p>Version: {config.version}</p>
          <p>This is the main content area that changes during the journey.</p>
        </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);