import React, { useState } from "react";

interface AccordionItem {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  id?: string;
  showToggle?: boolean;
}

export function Accordion({ items, id = "accordion-group", showToggle = true }: AccordionProps) {
  const [allOpen, setAllOpen] = useState(false);
  
  const handleToggleAll = () => {
    const newState = !allOpen;
    setAllOpen(newState);
    
    // Trigger Bootstrap collapse on all items
    items.forEach((_, index) => {
      const collapseElement = document.getElementById(`collapse-${id}-${index}`);
      if (collapseElement) {
        const bsCollapse = new (window as any).bootstrap.Collapse(collapseElement, {
          toggle: false
        });
        if (newState) {
          bsCollapse.show();
        } else {
          bsCollapse.hide();
        }
      }
    });
  };
  
  return (
    <div className="accordion-group">
      {showToggle && (
        <div className="accordion-toggle">
          <button 
            className={`accordion-toggle-btn ${allOpen ? 'accordion-toggle-btn--open' : 'accordion-toggle-btn--closed'}`}
            type="button"
            onClick={handleToggleAll}
          >
            {allOpen ? 'Close all' : 'Open all'}
          </button>
        </div>
      )}
      
      <div className="accordion" id={id}>
        {items.map((item, index) => {
          const headingId = `heading-${id}-${index}`;
          const collapseId = `collapse-${id}-${index}`;
          const isOpen = item.defaultOpen || false;
          
          return (
            <div className="accordion-item" key={index}>
              <h2 className="accordion-header" id={headingId}>
                <button
                  className={`accordion-button ${!isOpen ? 'collapsed' : ''}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#${collapseId}`}
                  aria-expanded={isOpen ? "true" : "false"}
                  aria-controls={collapseId}
                >
                  {item.title}
                </button>
              </h2>
              
              <div
                id={collapseId}
                className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
                aria-labelledby={headingId}
                role="region"
              >
                <div className="accordion-body">
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
