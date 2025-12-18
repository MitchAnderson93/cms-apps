import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Sidenav, InpageAlert } from "@repo/ui";

// Config injected at build time
declare const __APP_CONFIG__: any;

function PageContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = __APP_CONFIG__ || {};
  const pages = config.pages || [];
  
  const currentPage = pages.find((p: any) => p.path === location.pathname);
  
  // Redirect / to first page
  useEffect(() => {
    if (location.pathname === "/" && pages.length > 0) {
      navigate(pages[0].path, { replace: true });
    }
  }, [location.pathname, pages, navigate]);
  
  if (!currentPage) {
    // If we're at / and about to redirect, show loading
    if (location.pathname === "/" && pages.length > 0) {
      return <p>Loading...</p>;
    }
    return (
      <>
        <h1>Page Not Found</h1>
        <p>The page "{location.pathname}" does not exist.</p>
      </>
    );
  }
  
  // Support both old string content and new array content
  const contentArray = Array.isArray(currentPage.content) 
    ? currentPage.content 
    : [{ type: "text", content: currentPage.content }];
  
  return (
    <>
      <h1>{currentPage.title}</h1>
      {contentArray.map((item: any, index: number) => {
        switch (item.type) {
          case "inpage-alert":
            return (
              <InpageAlert
                key={index}
                type={item.alertType || "info"}
                heading={item.heading}
                content={item.content}
              />
            );
          case "html":
            return <div key={index} dangerouslySetInnerHTML={{ __html: item.content }} />;
          case "text":
          default:
            return <p key={index}>{item.content}</p>;
        }
      })}
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
      <div className="col-12 col-lg-3 pe-lg-0 order-last order-lg-first mt-40 mt-lg-0">
        <Sidenav
          collapseTitle={nav.collapseTitle}
          navtitle={nav.navtitle || "Navigation"}
          navtitlelink={nav.navtitlelink}
          navlist={nav.navlist || []}
        />
      </div>
      <div className="col-12 ps-lg-64 col-lg-6 qld-content-body">
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