/**
 * Main application entry point for the CMS React application.
 * 
 * This file orchestrates a dynamic, config-driven form system with:
 * - Multi-page forms with client-side routing
 * - Conditional field visibility based on user responses
 * - Progressive page locking (sequential navigation)
 * - Dynamic help guide system with page-specific content
 * - Form validation and submission handling
 * - Debug mode for development
 * 
 * @module main
 */

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Sidenav, InpageAlert, Button, Accordion, Checkbox, ButtonGroup, Image, Questionaire, HelpGuide, Callout, Select } from "@repo/react-ui";
import { createPortal } from "react-dom";
import { satisfiesConditions } from "./utils/validation.js";
import { useAppConfig } from "./hooks/useAppConfig.js";
import { useProgressiveLocking } from "./hooks/useProgressiveLocking.js";
import { ScrollToTop } from "./components/ScrollToTop.js";

// Styles
import "./styles/overrides.css";

/**
 * Renders the main content area for the current page/route.
 * 
 * Responsibilities:
 * - Renders page content dynamically based on JSON configuration
 * - Manages form validation state for all questions/inputs
 * - Handles conditional visibility of content items
 * - Processes cascading field dependencies
 * - Validates required fields before allowing navigation
 * 
 * @param {Object} props - Component props
 * @param {Record<string, any>} props.validationState - Current form state (all user inputs)
 * @param {Function} props.setValidationState - State setter for updating form values
 * @param {Function} props.markPageCompleted - Callback to mark a page as completed for progressive locking
 * 
 * @todo Replace `any` types with proper TypeScript interfaces
 * @todo Break this component into smaller, more focused components
 */
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
  
  /** 
   * Auto-redirect from root path to the first configured page.
   * This ensures users always land on actual content rather than a blank root.
   */
  useEffect(() => {
    if (location.pathname === "/" && pages.length > 0) {
      navigate(pages[0].path, { replace: true });
    }
  }, [location.pathname, pages, navigate]);
  
  // Validation state persists across page navigation to maintain user progress
  if (!currentPage) {
    // Show loading state during redirect to prevent flash of 404
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
  
  /**
   * Normalize content format for backward compatibility.
   * Legacy configs used a single string, modern configs use an array of typed content blocks.
   */
  const contentArray = Array.isArray(currentPage.content) 
    ? currentPage.content 
    : [{ type: "text", content: currentPage.content }];

  /** 
   * Field dependencies config - when a field changes, dependent fields are cleared.
   * Example: Changing "State" might clear "City" and "Zip Code" fields.
   */
  const fieldDependencies = config.fieldDependencies || {};

  /**
   * Collects all currently visible questions from the current page.
   * 
   * Questions can be hidden based on conditional logic (visibleWhen).
   * Only visible questions are included in validation.
   * 
   * @returns Array of question metadata (id, type, required status, minRows for tables)
   * 
   * @todo Consider memoizing this function - it recalculates on every render
   */
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

  /**
   * Validates that all visible required questions have valid answers.
   * 
   * Validation rules:
   * - All required fields must have a value (not null/undefined)
   * - Text inputs must have non-empty trimmed strings
   * - Multi-select questions must have at least one selection
   * - Data tables must meet minimum row requirements
   * 
   * Used to enable/disable navigation buttons and prevent incomplete submissions.
   * 
   * @returns true if all visible required questions are answered, false otherwise
   */
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
        /** 
         * Conditional visibility: Hide content items that don't meet their visibleWhen criteria.
         * This allows showing/hiding content based on user answers to other questions.
         */
        if (item.visibleWhen && !satisfiesConditions(item.visibleWhen, validationState)) {
          return null;
        }
        
        // Render appropriate component based on content type from config
        switch (item.type) {
          case "inpage-alert":
            /**
             * InpageAlert: Displays informational boxes (info, warning, error, success).
             * Supports dynamic content via `appendFromAnswers` to interpolate user responses.
             */
            return (
              <InpageAlert
                key={index}
                type={item.alertType || "info"}
                heading={item.heading}
                content={item.content}
                // Conditionally inject answer interpolation to maintain backward compatibility
                {...(item.appendFromAnswers ? { answers: validationState, appendFromAnswers: item.appendFromAnswers } : {})}
              />
            );
          case "button":
            /**
             * Button: Single call-to-action with navigation.
             * 
             * Schema:
             * {
             *   "type": "button",
             *   "text": "Button Label",
             *   "link": "/page-path",
             *   "variant": "primary" | "secondary" | "tertiary",
             *   "size": string,
             *   "customClass": string
             * }
             * 
             * @see COMPONENT_SCHEMAS.md#button
             */
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
            /**
             * Image: Displays an image with accessibility support.
             * 
             * Schema:
             * {
             *   "type": "image",
             *   "src": "https://example.com/image.jpg",
             *   "alt": "Descriptive alt text",
             *   "noMaxWidth": boolean
             * }
             * 
             * @see COMPONENT_SCHEMAS.md#image
             */
            return (
              <Image
                key={index}
                src={item.src}
                alt={item.alt}
                noMaxWidth={item.noMaxWidth}
              />
            );
          case "accordion":
            /**
             * Accordion: Collapsible content sections.
             * 
             * Schema:
             * {
             *   "type": "accordion",
             *   "id": "unique-id",
             *   "showToggle": boolean,
             *   "items": [
             *     { "title": "Section Title", "content": "<p>Content</p>" }
             *   ]
             * }
             * 
             * @see COMPONENT_SCHEMAS.md#accordion
             */
            return (
              <Accordion
                key={index}
                items={item.items}
                id={item.id || `accordion-${index}`}
                showToggle={item.showToggle !== false}
              />
            );
          case "checkbox":
            /**
             * Checkbox: Single checkbox input for binary choices.
             * 
             * Schema:
             * {
             *   "type": "checkbox",
             *   "id": "field-id",
             *   "label": "Checkbox label text",
             *   "required": boolean
             * }
             * 
             * Stores boolean value in validation state.
             * 
             * @see COMPONENT_SCHEMAS.md#checkbox
             */
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
            /**
             * Select: Dropdown selection input.
             * 
             * Schema:
             * {
             *   "type": "select",
             *   "id": "field-id",
             *   "label": "Select label",
             *   "options": [
             *     { "value": "option1", "label": "Option 1" }
             *   ],
             *   "required": boolean,
             *   "hint": "Help text",
             *   "errorMessage": "Error text",
             *   "successMessage": "Success text",
             *   "optional": boolean
             * }
             * 
             * @see COMPONENT_SCHEMAS.md#select
             */
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
            /**
             * ButtonGroup: Renders navigation/action buttons with built-in validation.
             * Validation priority:
             * 1. Button-specific validateWhen conditions (most specific)
             * 2. Checkbox validation (legacy feature)
             * 3. All visible questions answered (default)
             */
            return (
              <ButtonGroup
                key={index}
                buttons={item.buttons}
                onValidate={(button) => {
                  // Per-button validation conditions (e.g., "only enable if answer === 'yes'")
                  if (button && Array.isArray(button.validateWhen)) {
                    return satisfiesConditions(button.validateWhen, validationState);
                  }
                  // Legacy: validate against a specific checkbox field
                  if (item.validateCheckbox) {
                    return validationState[item.validateCheckbox] === true;
                  }
                  // Default: validate all visible questions on the current page
                  return areVisibleQuestionsAnswered();
                }}
                onNavigateSuccess={(link) => {
                  /**
                   * Mark current page as completed for progressive locking.
                   * This enables the next page in the navigation sequence.
                   */
                  if (currentPage?.path) {
                    markPageCompleted(currentPage.path);
                  }
                }}
                onSubmit={async () => {
                  /**
                   * Form submission handler - POSTs all validation state to configured endpoint.
                   * 
                   * @todo Add user-facing error messages instead of just console logs
                   * @todo Consider adding loading state during submission
                   * @todo Add success feedback/redirect after submission
                   */
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
            /**
             * Questionnaire: Renders a group of related questions.
             * Handles cascading dependencies - when a parent field changes,
             * all dependent fields are cleared to prevent invalid state.
             * 
             * Example: Changing "Have pets?" from Yes to No clears "What type of pet?"
             */
            return (
              <Questionaire
                key={index}
                questions={item.questions}
                answers={validationState}
                onAnswerChange={(id, value) => {
                  setValidationState(prev => {
                    const next = { ...prev };
                    // Remove field if value is undefined (deselection)
                    if (value === undefined) {
                      delete next[id];
                    } else {
                      next[id] = value;
                    }
                    
                    /**
                     * Cascade: Clear dependent fields when parent changes.
                     * Prevents stale data from conditional fields.
                     */
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
            /**
             * HTML: Renders raw HTML content.
             * 
             * Schema:
             * {
             *   "type": "html",
             *   "content": "<p>Your <strong>HTML</strong> content</p>"
             * }
             * 
             * Security Warning: Uses dangerouslySetInnerHTML.
             * Only use with trusted, sanitized content to prevent XSS attacks.
             * 
             * @see COMPONENT_SCHEMAS.md#html
             */
            return <div key={index} dangerouslySetInnerHTML={{ __html: item.content }} />;
          case "callout":
            /**
             * Callout: Highlighted informational box for important notices.
             * 
             * Schema:
             * {
             *   "type": "callout",
             *   "title": "Callout Title",
             *   "description": "Important information",
             *   "className": "additional-css-classes"
             * }
             * 
             * @see COMPONENT_SCHEMAS.md#callout
             */
            return (
              <Callout
                key={index}
                title={item.title}
                description={item.description}
                className={item.className}
              />
            );
          case "debug-button":
            /**
             * Debug Button: Development-only feature for inspecting form state.
             * Only rendered when VITE_DEBUG environment variable is set.
             * 
             * Logs validation state organized by page for easier debugging.
             */
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
            /**
             * Text: Simple paragraph text (default component).
             * 
             * Schema:
             * {
             *   "type": "text",  // Optional, defaults to "text"
             *   "content": "Your text content"
             * }
             * 
             * This is the default case for any unrecognized component type.
             * 
             * @see COMPONENT_SCHEMAS.md#text
             */
            return <p key={index}>{item.content}</p>;
        }
      })}
    </>
  );
}

/**
 * Main application layout component.
 * 
 * Renders the page layout with optional side navigation.
 * Layout switches between:
 * - Full-width (12 columns) when sidenav is disabled
 * - 3-column sidenav + 6-column content when sidenav is enabled
 * 
 * Manages shared state for:
 * - Form validation state (all user inputs across all pages)
 * - Completed pages (for progressive locking)
 * 
 * @returns JSX layout with optional sidenav and main content area
 */
function App() {
  const location = useLocation();
  const config = useAppConfig();
  const nav = config.navigation || {};
  const sidenavEnabled = nav.enabled === true;
  
  /**
   * Global form state - persists across navigation.
   * Contains all user inputs from all pages (keys are field IDs).
   */
  const [validationState, setValidationState] = useState<Record<string, any>>({});
  
  /**
   * Tracks which pages have been completed.
   * Used for progressive locking - users must complete pages sequentially.
   */
  const [completedPages, setCompletedPages] = useState<Set<string>>(new Set());
  
  /**
   * Calculate which navigation links should be disabled based on completed pages.
   * Progressive locking enforces sequential navigation through the form.
   */
  const disabledPaths = useProgressiveLocking(nav.navlist || [], completedPages);
  
  /**
   * Callback to mark a page as completed.
   * Called when user successfully navigates away from a validated page.
   */
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

/**
 * Root component that sets up routing and the help guide system.
 * 
 * Responsibilities:
 * - Initialize HashRouter for client-side routing
 * - Create routes for all configured pages
 * - Manage help guide modal state
 * - Intercept helpGuide# links to open help modal with specific section
 * - Render page-specific or global help content via portal
 * 
 * @returns Application wrapped in router with help guide overlay
 */
function AppWithRouter() {
  const config = useAppConfig();
  const pages = config.pages || [];
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpActive, setHelpActive] = useState<string | undefined>(undefined);
  
  /**
   * Global click handler to intercept special helpGuide# links.
   * 
   * Allows inline links in content to open the help modal and jump to a specific section.
   * Example: <a href="helpGuide#eligibility">Learn about eligibility</a>
   * 
   * @todo Move magic string "helpGuide#" to a constant
   */
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
  
  /**
   * Portal component that renders the help guide modal outside the main DOM tree.
   * 
   * Determines which help content to show based on:
   * 1. Page-specific help sections (highest priority)
   * 2. Global fallback for specific pages like /limitations
   * 3. No help content if neither is available
   * 
   * Supports both legacy flat sections and new grouped section format.
   * 
   * @param {Object} props
   * @param {boolean} props.open - Whether the help modal is open
   * @param {string} [props.activeId] - Section ID to scroll to/highlight when opened
   * 
   * @todo Remove hardcoded "/limitations" path - make configurable
   */
  function HelpGuidePortal({ open, activeId }: { open: boolean; activeId?: string }) {
    const location = useLocation();
    const cfg = useAppConfig();
    const ps = cfg.pages || [];
    const currentPage = ps.find((p: any) => p.path === location.pathname);
    
    /**
     * Help content resolution:
     * Supports backward compatibility between old (flat sections) and new (section groups) formats.
     */
    const pageSections = (currentPage?.helpGuide?.sections) || [];
    const pageSectionGroups = (currentPage?.helpGuide?.sectionGroups) || null;
    
    // Global help content (fallback for specific pages)
    const globalSections = (cfg.helpGuide?.sections) || [];
    const globalSectionGroups = (cfg.helpGuide?.sectionGroups) || null;
    
    /**
     * Priority order for help content:
     * 1. Page-specific section groups (modern format)
     * 2. Page-specific sections (legacy format)
     * 3. Global content (only for /limitations page as hardcoded exception)
     * 4. No help content (portal doesn't render)
     */
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

/**
 * Application entry point - mounts the React app to the DOM.
 * 
 * StrictMode is enabled for development warnings and future React features.
 * Uses React 18's createRoot API for concurrent rendering.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWithRouter />
  </React.StrictMode>
);