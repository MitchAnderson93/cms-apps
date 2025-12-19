import React, { useEffect, useMemo, useRef } from "react";

export interface HelpGuideSection {
  id: string;
  title: string;
  content: string;
}

interface HelpGuideProps {
  open: boolean;
  sections: HelpGuideSection[];
  activeSectionId?: string;
  onClose: () => void;
  onOpen: () => void;
}

export function HelpGuide({ open, sections, activeSectionId, onClose, onOpen }: HelpGuideProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeId = useMemo(() => {
    if (activeSectionId) return activeSectionId;
    return sections[0]?.id;
  }, [activeSectionId, sections]);

  useEffect(() => {
    if (!open) return;
    const el = sectionRefs.current[activeId || ""];
    if (el && containerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [open, activeId]);

  return (
    <>
      {/* Inline minimal styles for simplicity */}
      <style>
        {`
        .help-tab-btn {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1040;
          background: #0d6efd;
          color: #fff;
          padding: 8px 12px;
          border-top-left-radius: 6px;
          border-bottom-left-radius: 6px;
          border: none;
          cursor: pointer;
        }
        @media (max-width: 576px) {
          .help-tab-btn {
            bottom: 0;
            top: auto;
            transform: none;
            right: 0;
            border-top-left-radius: 6px;
            border-top-right-radius: 0;
          }
        }
        .help-panel {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: 100vw;
          max-width: 370px;
          background: #fff;
          box-shadow: -2px 0 12px rgba(0,0,0,0.2);
          z-index: 1041;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.25s ease-in-out;
        }
        .help-panel.open {
          transform: translateX(0);
        }
        @media (max-width: 576px) {
          .help-panel {
            width: 100vw;
            max-width: 370px;
            bottom: 0;
            top: auto;
            right: 0;
            height: 100vh;
            transform: translateY(100%);
          }
          .help-panel.open {
            transform: translateY(0);
          }
        }
        .help-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }
        .help-body {
          overflow-y: auto;
          padding: 12px;
          flex: 1 1 auto;
        }
        .help-section {
          margin-bottom: 16px;
        }
        .help-hide-btn {
          border: none;
          background: transparent;
          color: #0d6efd;
          cursor: pointer;
        }
        `}
      </style>
      {!open && (
        <button className="help-tab-btn" type="button" onClick={onOpen} aria-label="Open help">
          Help
        </button>
      )}

      <div className={`help-panel ${open ? 'open' : ''}`} role="dialog" aria-label="Help guide" aria-hidden={!open}>
        <div className="help-header">
          <strong>Help guide</strong>
          <button className="help-hide-btn" type="button" onClick={onClose} aria-label="Hide help">Hide ×</button>
        </div>
        <div className="help-body" ref={containerRef}>
          {sections.map((s) => (
            <div
              key={s.id}
              id={`help-${s.id}`}
              className="help-section"
              ref={(el) => { sectionRefs.current[s.id] = el; }}
            >
              <h3>{s.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: s.content }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
