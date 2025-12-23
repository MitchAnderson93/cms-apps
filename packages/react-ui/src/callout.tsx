import React from "react";

export interface CalloutProps {
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({ title, description, className = "", children }) => (
  <div className={`callout ${className}`.trim()}>
    {title && <h3 className="callout-title">{title}</h3>}
    <div className="callout-text" dangerouslySetInnerHTML={{ __html: description }} />
    {children}
  </div>
);

export default Callout;
