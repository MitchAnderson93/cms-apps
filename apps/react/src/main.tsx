import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Sidenav, InpageAlert, Button, Accordion, Checkbox, ButtonGroup, Image, Questionaire, HelpGuide, Callout, Select } from "@repo/react-ui";
import { createPortal } from "react-dom";
import { satisfiesConditions } from "./utils/validation.js";
import { useAppConfig } from "./hooks/useAppConfig.js";
import { useProgressiveLocking } from "./hooks/useProgressiveLocking.js";
import { ScrollToTop } from "./components/ScrollToTop.js";
import "./styles/overrides.css";

function PageContent({ 
  validationState, 
  setValidationState,
  markPageCompleted
}: { 
  validationState: Record<string, any>; 
  setValidationState: React.Dispatch<React.SetStateAction<Record<string, any>>>; 
  markPageCompleted: (path: string) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const config = useAppConfig();
  const pages = config.pages || [];
  const currentPage = pages.find((p: any) => p.path === location.pathname);
  
  // Redirect / to first page
  useEffect(() => {
    if (location.pathname === "/" && pages.length > 0) {
      navigate(pages[0].path, { replace: true });
    }
  }, [location.pathname, pages, navigate]);
  
  // Keep validation state across navigation within the session
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

  // Get field dependencies for cascading updates
  const fieldDependencies = config.fieldDependencies || {};

  const getAllVisibleQuestions = (): Array<{ id: string; type?: string; required?: boolean; minRows?: number }> => {
    const qs: Array<{ id: string; type?: string; required?: boolean; minRows?: number }> = [];
    contentArray.forEach((item: any) => {
      if (item.type === "questionaire" && Array.isArray(item.questions)) {
        item.questions.forEach((q: any) => {
          const visible = !q.visibleWhen || satisfiesConditions(q.visibleWhen, validationState);
          if (visible) qs.push({ id: q.id, type: q.type, required: q.required, minRows: q.minRows });
        });
      }
    });
    return qs;
  };

  const areVisibleQuestionsAnswered = (): boolean => {
    const qs = getAllVisibleQuestions();
    return qs.every(({ id, type, required, minRows }) => {
      const v = validationState[id];
      if (v === undefined || v === null) return false;
      if (type === "multi") return Array.isArray(v) && v.length > 0;
      if (type === "data-table") {
        // Validate data-table: check if array has enough filled rows
        if (!Array.isArray(v)) return false;
        const filledRows = v.filter((row: string) => row && row.trim().length > 0);
        const minRequired = minRows || 1;
        return filledRows.length >= minRequired && (!required || filledRows.length > 0);
      }
      if (typeof v === "string") return v.trim().length > 0;
      return true; // booleans/numbers considered answered
    });
  };
  
  return (
    <>
      <h1>{currentPage.title}</h1>
      {contentArray.map((item: any, index: number) => {
        // Support conditional visibility for any content item via visibleWhen
        if (item.visibleWhen && !satisfiesConditions(item.visibleWhen, validationState)) {
          return null;
        }
        switch (item.type) {
          case "inpage-alert":
            return (
              <InpageAlert
                key={index}
                type={item.alertType || "info"}
                heading={item.heading}
                content={item.content}
                // Only pass answers and appendFromAnswers if config present (non-breaking)
                {...(item.appendFromAnswers ? { answers: validationState, appendFromAnswers: item.appendFromAnswers } : {})}
              />
            );
          case "button":
            return (
              <Button
                key={index}
                text={item.text}
                link={item.link}
                variant={item.variant}
                size={item.size}
                customClass={item.customClass}
              />
            );
          case "image":
            return (
              <Image
                key={index}
                src={item.src}
                alt={item.alt}
                noMaxWidth={item.noMaxWidth}
              />
            );
          case "accordion":
            return (
              <Accordion
                key={index}
                items={item.items}
                id={item.id || `accordion-${index}`}
                showToggle={item.showToggle !== false}
              />
            );
          case "checkbox":
            return (
              <Checkbox
                key={index}
                id={item.id || `checkbox-${index}`}
                label={item.label}
                checked={validationState[item.id] || false}
                onChange={(checked) => setValidationState(prev => ({ ...prev, [item.id]: checked }))}
                required={item.required}
              />
            );
          case "select":
            return (
              <Select
                key={index}
                id={item.id || `select-${index}`}
                label={item.label}
                options={item.options || []}
                value={validationState[item.id] || ""}
                onChange={(value) => setValidationState(prev => ({ ...prev, [item.id]: value }))}
                required={item.required}
                hint={item.hint}
                errorMessage={item.errorMessage}
                successMessage={item.successMessage}
                optional={item.optional}
              />
            );
          case "button-group":
            return (
              <ButtonGroup
                key={index}
                buttons={item.buttons}
                onValidate={(button) => {
                  // If button has validateWhen, use it for validation
                  if (button && Array.isArray(button.validateWhen)) {
                    return satisfiesConditions(button.validateWhen, validationState);
                  }
                  if (item.validateCheckbox) {
                    return validationState[item.validateCheckbox] === true;
                  }
                  return areVisibleQuestionsAnswered();
                }}
                onNavigateSuccess={(link) => {
                  // Mark current page as completed when navigation occurs
                  if (currentPage?.path) {
                    markPageCompleted(currentPage.path);
                  }
                }}
                onSubmit={async () => {
                  const submissionEndpoint = config.submissionEndpoint;
                  if (!submissionEndpoint) {
                    if (import.meta.env.VITE_DEBUG) {
                      console.error("No submission endpoint configured");
                    }
                    alert("No submission endpoint configured");
                    return;
                  }
                  
                  try {
                    const response = await fetch(submissionEndpoint, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        data: validationState,
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    if (import.meta.env.VITE_DEBUG) {
                      console.log("Submission successful:", data);
                    }
                  } catch (error) {
                    if (import.meta.env.VITE_DEBUG) {
                      console.error("Submission failed:", error);
                    }
                  }
                }}
              />
            );
          case "questionaire":
            return (
              <Questionaire
                key={index}
                questions={item.questions}
                answers={validationState}
                onAnswerChange={(id, value) => {
                  setValidationState(prev => {
                    const next = { ...prev };
                    if (value === undefined) {
                      delete next[id];
                    } else {
                      next[id] = value;
                    }
                    
                    // Handle cascading field dependencies
                    if (fieldDependencies[id]) {
                      fieldDependencies[id].forEach((dependentId: string) => {
                        delete next[dependentId];
                      });
                    }
                    
                    return next;
                  });
                }}
              />
            );
          case "html":
            return <div key={index} dangerouslySetInnerHTML={{ __html: item.content }} />;
          case "callout":
            return (
              <Callout
                key={index}
                title={item.title}
                description={item.description}
                className={item.className}
              />
            );
          case "debug-button":
            if (!import.meta.env.VITE_DEBUG) return null;
            
            return (
              <button
                key={index}
                onClick={() => {
                  const pages = config.pages || [];
                  const byPage: Record<string, any> = {};
                  const unmapped: Record<string, any> = {};
                  
                  // Build a map of field ID to page
                  const fieldToPage: Record<string, string> = {};
                  pages.forEach((page: any) => {
                    const contentArray = Array.isArray(page.content) ? page.content : [];
                    contentArray.forEach((item: any) => {
                      if (item.type === "questionaire" && Array.isArray(item.questions)) {
                        item.questions.forEach((q: any) => {
                          if (q.id) fieldToPage[q.id] = page.path;
                        });
                      }
                      if ((item.type === "checkbox" || item.type === "select") && item.id) {
                        fieldToPage[item.id] = page.path;
                      }
                    });
                  });
                  
                  // Group validation state by page
                  Object.keys(validationState).forEach(key => {
                    const pagePath = fieldToPage[key];
                    if (pagePath) {
                      if (!byPage[pagePath]) byPage[pagePath] = {};
                      byPage[pagePath][key] = validationState[key];
                    } else {
                      unmapped[key] = validationState[key];
                    }
                  });
                  
                  console.log('=== Validation State by Page ===');
                  Object.keys(byPage).forEach(pagePath => {
                    const page = pages.find((p: any) => p.path === pagePath);
                    console.log(`\n${page?.title || pagePath} (${pagePath}):`);
                    console.log(byPage[pagePath]);
                  });
                  
                  if (Object.keys(unmapped).length > 0) {
                    console.log('\nUnmapped fields:');
                    console.log(unmapped);
                  }
                  
                  console.log('\n=== Full State ===');
                  console.log(validationState);
                }}
                className="btn btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                Debug: Log Payload
              </button>
            );
          case "text":
          default:
            return <p key={index}>{item.content}</p>;
        }
      })}
    </>
  );
}

function App() {
  const location = useLocation();
  const config = useAppConfig();
  const nav = config.navigation || {};
  const sidenavEnabled = nav.enabled === true;
  
  // Track validation state and completed pages across navigation
  const [validationState, setValidationState] = useState<Record<string, any>>({});
  const [completedPages, setCompletedPages] = useState<Set<string>>(new Set());
  
  // Get disabled paths based on sequential progression
  const disabledPaths = useProgressiveLocking(nav.navlist || [], completedPages);
  
  // Mark current page as completed when validation passes
  const markPageCompleted = (path: string) => {
    setCompletedPages(prev => new Set([...prev, path]));
  };
  
  if (!sidenavEnabled) {
    // Full width layout without sidenav
    return (
      <div className="row">
        <div className="col-12">
          <PageContent 
            validationState={validationState} 
            setValidationState={setValidationState}
            markPageCompleted={markPageCompleted}
          />
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
          disabledPaths={disabledPaths}
        />
      </div>
      <div className="col-12 ps-lg-64 col-lg-6 mb-4">
        <PageContent 
          validationState={validationState} 
          setValidationState={setValidationState}
          markPageCompleted={markPageCompleted}
        />
      </div>
    </div>
  );
}

function AppWithRouter() {
  const config = useAppConfig();
  const pages = config.pages || [];
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpActive, setHelpActive] = useState<string | undefined>(undefined);
  
  // Intercept links like helpGuide#section to open the help and focus the section
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (href.startsWith('helpGuide#')) {
        e.preventDefault();
        const section = href.split('#')[1];
        setHelpActive(section);
        setHelpOpen(true);
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);
  
  // Portal component to render HelpGuide with page-specific sections
  function HelpGuidePortal({ open, activeId }: { open: boolean; activeId?: string }) {
    const location = useLocation();
    const cfg = useAppConfig();
    const ps = cfg.pages || [];
    const currentPage = ps.find((p: any) => p.path === location.pathname);
    
    // Support both legacy flat sections and new grouped format
    const pageSections = (currentPage?.helpGuide?.sections) || [];
    const pageSectionGroups = (currentPage?.helpGuide?.sectionGroups) || null;
    
    // Allow fallback to top-level sections, but only render on Limitations
    const globalSections = (cfg.helpGuide?.sections) || [];
    const globalSectionGroups = (cfg.helpGuide?.sectionGroups) || null;
    
    // Determine what to use: page-specific first, then global fallback for specific pages
    const useSectionGroups = pageSectionGroups || (currentPage?.path === '/limitations' ? globalSectionGroups : null);
    const useSections = (!useSectionGroups && pageSections && pageSections.length > 0)
      ? pageSections
      : (!useSectionGroups && currentPage?.path === '/limitations' ? globalSections : []);
    
    if (!useSectionGroups && (!useSections || useSections.length === 0)) return null;
    
    return createPortal(
      <HelpGuide
        open={open}
        sections={useSectionGroups ? undefined : useSections}
        sectionGroups={useSectionGroups || undefined}
        activeSectionId={activeId}
        onClose={() => setHelpOpen(false)}
        onOpen={() => setHelpOpen(true)}
      />,
      document.body
    );
  }

  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        {pages.map((page: any) => (
          <Route key={page.path} path={page.path} element={<App />} />
        ))}
        <Route path="*" element={<App />} />
      </Routes>
      <HelpGuidePortal open={helpOpen} activeId={helpActive} />
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWithRouter />
  </React.StrictMode>
);