import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Sidenav, InpageAlert, Button, Accordion, Checkbox, ButtonGroup, Image, Questionaire, HelpGuide, Callout, Select } from "@repo/react-ui";
import { createPortal } from "react-dom";

// FINDME: Hotfix to exclude global CMS style that adds unwanted margin to list items
// This style override is necessary because .qld-content-body li { margin-top: .5rem; }
// is a global limitation of the embedded app that affects our component styling
const styleOverride = `
  .qld-content-body li {
    margin-top: 0 !important;
  }
  
  /* Disabled state for sidenav links */
  .qld-side-navigation .nav-link.disabled {
    color: var(--bs-secondary-color);
    pointer-events: none;
    cursor: default;
    opacity: 0.5;
  }
`;

// Config injected at build time
declare const __APP_CONFIG__: any;

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}

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
  const config = __APP_CONFIG__ || {};
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

  // Helpers for conditional visibility and questionnaire validation
  const satisfiesConditions = (conds?: Array<{ id: string; value?: any; answered?: boolean; required?: boolean; minLength?: number; maxLength?: number; pattern?: string }>): boolean => {
    if (!conds || conds.length === 0) return true;
    return conds.every((c) => {
      const v = validationState[c.id];
      
      // Handle validation rules for text inputs
      if (c.answered !== undefined) {
        // Check if question is answered
        return v !== undefined && v !== null && v !== "";
      }
      
      if (c.required !== undefined && c.required) {
        // Check if required field has a value
        if (v === undefined || v === null || v === "") return false;
      }
      
      if (c.minLength !== undefined) {
        // Check minimum length for text inputs
        if (typeof v !== "string") return false;
        if (v.length < c.minLength) return false;
      }
      
      if (c.maxLength !== undefined) {
        // Check maximum length for text inputs
        if (typeof v === "string" && v.length > c.maxLength) return false;
      }
      
      if (c.pattern !== undefined) {
        // Check if value matches the pattern
        if (typeof v !== "string") return false;
        const regex = new RegExp("^" + c.pattern + "$");
        if (!regex.test(v)) return false;
      }
      
      // Handle value matching (for visibility conditions)
      if (c.value !== undefined) {
        if (Array.isArray(c.value)) {
          return Array.isArray(v) && c.value.every((cv) => v.includes(cv));
        }
        return v === c.value;
      }
      
      return true;
    });
  };

  const getAllVisibleQuestions = (): Array<{ id: string; type?: string }> => {
    const qs: Array<{ id: string; type?: string }> = [];
    contentArray.forEach((item: any) => {
      if (item.type === "questionaire" && Array.isArray(item.questions)) {
        item.questions.forEach((q: any) => {
          const visible = !q.visibleWhen || satisfiesConditions(q.visibleWhen);
          if (visible) qs.push({ id: q.id, type: q.type });
        });
      }
    });
    return qs;
  };

  const areVisibleQuestionsAnswered = (): boolean => {
    const qs = getAllVisibleQuestions();
    return qs.every(({ id, type }) => {
      const v = validationState[id];
      if (v === undefined || v === null) return false;
      if (type === "multi") return Array.isArray(v) && v.length > 0;
      if (typeof v === "string") return v.trim().length > 0;
      return true; // booleans/numbers considered answered
    });
  };
  
  {/* Debug: {config.appName} v:{config.version} */}
  return (
    <>
      <h1>{currentPage.title}</h1>
      {contentArray.map((item: any, index: number) => {
        // Support conditional visibility for any content item via visibleWhen
        if (item.visibleWhen && !satisfiesConditions(item.visibleWhen)) {
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
                    return satisfiesConditions(button.validateWhen);
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
                    // Special logic: if q_is_drink_complex changes, always clear q_special_purpose
                    if (id === "q_is_drink_complex") {
                      delete next["q_special_purpose"];
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
  const config = __APP_CONFIG__ || {};
  const nav = config.navigation || {};
  const sidenavEnabled = nav.enabled === true;
  
  // Track validation state and completed pages across navigation
  const [validationState, setValidationState] = useState<Record<string, any>>({});
  const [completedPages, setCompletedPages] = useState<Set<string>>(new Set());
  
  // Get all child page paths from navigation
  const getChildPaths = (navlist: any[]): string[] => {
    const childPaths: string[] = [];
    navlist.forEach((item: any) => {
      if (item.children && item.children.length > 0) {
        item.children.forEach((child: any) => {
          if (!child.link.startsWith("http") && !child.link.startsWith("#")) {
            childPaths.push(child.link);
          }
        });
      }
    });
    return childPaths;
  };
  
  // Get disabled paths based on sequential progression
  const allChildPaths = getChildPaths(nav.navlist || []);
  const currentPath = location.pathname;
  
  // Enable first child page by default, and any completed pages
  const disabledPaths = allChildPaths.filter((path, index) => {
    // First child is always enabled
    if (index === 0) return false;
    // Check if previous page is completed
    const previousPath = allChildPaths[index - 1];
    if (!previousPath) return true;
    return !completedPages.has(previousPath);
  });
  
  // Mark current page as completed when validation passes
  const markPageCompleted = (path: string) => {
    setCompletedPages(prev => new Set([...prev, path]));
  };
  
  // Debug: {config.appName} v{config.version}
  
  if (!sidenavEnabled) {
    // Full width layout without sidenav
    return (
      <div className="row">
        <div className="col-12">
          {/* Debug: {config.appName} v{config.version} */}
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
  const config = __APP_CONFIG__ || {};
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
    const cfg = __APP_CONFIG__ || {};
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
      {/* Render HelpGuide outside root constraints via portal, only for relevant pages */}
      <HelpGuidePortal open={helpOpen} activeId={helpActive} />
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <style dangerouslySetInnerHTML={{ __html: styleOverride }} />
    <AppWithRouter />
  </React.StrictMode>
);