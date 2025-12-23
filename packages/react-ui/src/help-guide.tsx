import React, { useEffect, useMemo, useRef } from "react";
import { Accordion } from "./accordion";

export interface HelpGuideSection {
  id: string;
  title: string;
  content: string;
}

export interface HelpGuideSectionGroup {
  groupTitle?: string;
  sections: HelpGuideSection[];
}

interface HelpGuideProps {
  open: boolean;
  sections?: HelpGuideSection[]; // Legacy format - flat array
  sectionGroups?: HelpGuideSectionGroup[]; // New format - grouped sections
  activeSectionId?: string;
  onClose: () => void;
  onOpen: () => void;
}

export function HelpGuide({ open, sections, sectionGroups, activeSectionId, onClose, onOpen }: HelpGuideProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Normalize to groups format for easier handling
  const normalizedGroups = useMemo(() => {
    if (sectionGroups) {
      return sectionGroups;
    }
    // Legacy flat sections format
    if (sections) {
      return [{ sections }];
    }
    return [];
  }, [sections, sectionGroups]);
  
  // Flatten all sections for global operations
  const allSections = useMemo(() => {
    return normalizedGroups.flatMap(g => g.sections);
  }, [normalizedGroups]);

  const activeId = useMemo(() => {
    if (activeSectionId) return activeSectionId;
    return allSections[0]?.id;
  }, [activeSectionId, allSections]);

  // Map section id to group and index for targeted open
  const idToLocation = useMemo(() => {
    const map: Record<string, { groupIndex: number; sectionIndex: number }> = {};
    normalizedGroups.forEach((group, groupIdx) => {
      group.sections.forEach((s, sectionIdx) => {
        map[s.id] = { groupIndex: groupIdx, sectionIndex: sectionIdx };
      });
    });
    return map;
  }, [normalizedGroups]);

  const getAccordionId = (groupIndex: number) => `help-accordion-group-${groupIndex}`;

  const openAll = () => {
    normalizedGroups.forEach((group, groupIndex) => {
      const accordionId = getAccordionId(groupIndex);
      group.sections.forEach((_, sectionIndex) => {
        const collapseElement = document.getElementById(`collapse-${accordionId}-${sectionIndex}`);
        if (collapseElement && (window as any).bootstrap?.Collapse) {
          const bsCollapse = new (window as any).bootstrap.Collapse(collapseElement, { toggle: false });
          bsCollapse.show();
        }
      });
    });
  };

  const closeAll = () => {
    normalizedGroups.forEach((group, groupIndex) => {
      const accordionId = getAccordionId(groupIndex);
      group.sections.forEach((_, sectionIndex) => {
        const collapseElement = document.getElementById(`collapse-${accordionId}-${sectionIndex}`);
        if (collapseElement && (window as any).bootstrap?.Collapse) {
          const bsCollapse = new (window as any).bootstrap.Collapse(collapseElement, { toggle: false });
          bsCollapse.hide();
        }
      });
    });
  };

  const openSectionById = (id?: string) => {
    if (!id) return;
    const location = idToLocation[id];
    if (!location) return;
    const accordionId = getAccordionId(location.groupIndex);
    const collapseElement = document.getElementById(`collapse-${accordionId}-${location.sectionIndex}`);
    if (collapseElement && (window as any).bootstrap?.Collapse) {
      const bsCollapse = new (window as any).bootstrap.Collapse(collapseElement, { toggle: false });
      bsCollapse.show();
    }
  };

  useEffect(() => {
    if (!open) return;
    // Ensure targeted section is expanded and scrolled into view
    openSectionById(activeId);
    // Scroll after a tick to allow collapse to animate
    setTimeout(() => {
      const location = activeId ? idToLocation[activeId] : undefined;
      if (!location) return;
      const accordionId = getAccordionId(location.groupIndex);
      const target = document.getElementById(`collapse-${accordionId}-${location.sectionIndex}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  }, [open, activeId, idToLocation]);

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
          padding: 8px 12px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }
        .help-titlebar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .help-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .help-link-btn {
          background: none;
          border: none;
          padding: 0;
          color: #0d6efd;
          text-decoration: underline;
          cursor: pointer;
          font: inherit;
        }
        .help-body {
          overflow-y: auto;
          padding: 12px;
          flex: 1 1 auto;
        }
        .help-section-group {
          margin-bottom: 24px;
        }
        .help-section-group:last-child {
          margin-bottom: 0;
        }
        .help-section-group-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: #212529;
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
          <div className="help-titlebar">
            <strong>Help guide</strong>
            <button className="help-hide-btn" type="button" onClick={onClose} aria-label="Hide help">Hide ×</button>
          </div>
          <div className="help-actions">
            <button className="help-link-btn" type="button" onClick={() => window.print()}>Print</button>
            <span>|</span>
            <button className="help-link-btn" type="button" onClick={openAll}>Expand all</button>
            <span>|</span>
            <button className="help-link-btn" type="button" onClick={closeAll}>Collapse all</button>
          </div>
        </div>
        <div className="help-body" ref={containerRef}>
          {normalizedGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="help-section-group">
              {group.groupTitle && (
                <h3 className="help-section-group-title">{group.groupTitle}</h3>
              )}
              <Accordion
                id={getAccordionId(groupIndex)}
                items={group.sections.map((s) => ({
                  title: s.title,
                  content: s.content,
                  defaultOpen: s.id === activeId
                }))}
                showToggle={false}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
