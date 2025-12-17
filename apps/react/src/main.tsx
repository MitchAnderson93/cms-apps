import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Sidenav } from "@repo/ui";

// Config injected at build time
declare const __APP_CONFIG__: any;

function PageContent() {
  const location = useLocation();
  const config = __APP_CONFIG__ || {};
  const pages = config.pages || [];
  
  const currentPage = pages.find((p: any) => p.path === location.pathname);
  
  if (!currentPage) {
    return (
      <>
        <h1>Page Not Found</h1>
        <p>The page "{location.pathname}" does not exist.</p>
      </>
    );
  }
  
  return (
    <>
      <h1>{currentPage.title}</h1>
      <p>{currentPage.content}</p>
    </>
  );
}

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
          <PageContent />
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
        <PageContent />
      </div>
    </div>
  );
}

function AppWithRouter() {
  const config = __APP_CONFIG__ || {};
  const pages = config.pages || [];
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {pages.map((page: any) => (
          <Route key={page.path} path={page.path} element={<App />} />
        ))}
        <Route path="*" element={<App />} />
      </Routes>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWithRouter />
  </React.StrictMode>
);