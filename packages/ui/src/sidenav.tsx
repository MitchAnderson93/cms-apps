import React, { useState } from "react";

interface NavItem {
  label: string;
  link: string;
  class?: string;
  target?: string;
  children?: NavItem[];
}

interface SidenavProps {
  collapseTitle?: string;
  navtitle: string;
  navtitlelink?: string;
  navlist: NavItem[];
}

function NavList({ items, level = 1 }: { items: NavItem[]; level?: number }) {
  const ulClass = level === 3 ? "with-stalks" : level > 1 ? "" : "nav";
  const ariaLabel = level === 1 ? "section navigation" : undefined;
  
  return (
    <ul className={ulClass} aria-label={ariaLabel}>
      {items.map((item, index) => {
        const isActive = item.class?.includes("active");
        
        return (
          <li key={index} className={`nav-item ${item.class || ""}`}>
            {isActive ? (
              <span className="nav-link">{item.label}</span>
            ) : (
              <a
                className="nav-link"
                href={item.link}
                target={item.target || undefined}
              >
                {item.label}
              </a>
            )}
            
            {item.children && item.children.length > 0 && (
              <NavList items={item.children} level={level + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Sidenav({
  collapseTitle = "In this section",
  navtitle,
  navtitlelink,
  navlist
}: SidenavProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <nav className="qld-side-navigation" aria-label="Side Navigation">
      <button
        className={`accordion-button ${isExpanded ? "" : "collapsed"} d-lg-none`}
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="sideNavCollapse"
      >
        {collapseTitle}
      </button>
      
      <div
        className={`nav-wrapper ${isExpanded ? "" : "collapse"} d-lg-block`}
        id="sideNavCollapse"
      >
        <h2 className="nav-title">
          {navtitlelink ? (
            <a className="nav-link" href={navtitlelink}>
              {navtitle}
            </a>
          ) : (
            navtitle
          )}
        </h2>

        <NavList items={navlist} />
      </div>
    </nav>
  );
}
