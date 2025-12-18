import React from "react";

interface InpageAlertProps {
  type?: "info" | "warning" | "success" | "error";
  heading?: string;
  headingTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  content: string;
  customClass?: string;
  ariaLabel?: string;
}

export function InpageAlert({ 
  type = "info", 
  heading,
  headingTag = "h2",
  content,
  customClass = "",
  ariaLabel
}: InpageAlertProps) {
  const variantClass = `alert-${type}`;
  
  // Default aria-labels based on type
  const defaultAriaLabel = ariaLabel || `${type.charAt(0).toUpperCase() + type.slice(1)} alert`;
  
  const HeadingTag = headingTag;
  
  return (
    <div 
      className={`alert ${variantClass} ${customClass}`.trim()}
      role="alert"
      aria-label={defaultAriaLabel}
    >
      {heading && (
        <HeadingTag className="alert-heading" dangerouslySetInnerHTML={{ __html: heading }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
