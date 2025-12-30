import React from "react";

interface InpageAlertProps {
  type?: "info" | "warning" | "success" | "error";
  heading?: string;
  headingTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  content: string;
  customClass?: string;
  ariaLabel?: string;
  answers?: Record<string, any>;
  appendFromAnswers?: {
    questionId: string;
    optionsMap?: Record<string, string>;
    separator?: string;
  };
}

export function InpageAlert({ 
  type = "info", 
  heading,
  headingTag = "h2",
  content,
  customClass = "",
  ariaLabel,
  answers,
  appendFromAnswers
}: InpageAlertProps) {
  const variantClass = `alert-${type}`;
  // Default aria-labels based on type
  const defaultAriaLabel = ariaLabel || `${type.charAt(0).toUpperCase() + type.slice(1)} alert`;
  const HeadingTag = headingTag;

  let appendedContent = content;
  if (appendFromAnswers && answers) {
    const selected = answers[appendFromAnswers.questionId];
    const extra = answers[`${appendFromAnswers.questionId}_extra`] || {};
    
    console.log('InpageAlert Debug:', {
      questionId: appendFromAnswers.questionId,
      selected,
      extra,
      hasOptionsMap: !!appendFromAnswers.optionsMap,
      allAnswers: answers
    });
    
    if (Array.isArray(selected) && selected.length > 0) {
      // If no optionsMap, treat selected as raw values (e.g., data-table)
      if (!appendFromAnswers.optionsMap) {
        const mapped = selected.filter(Boolean).join(appendFromAnswers.separator || " ");
        console.log('Mapped result (no optionsMap):', mapped);
        if (mapped) {
          appendedContent = content + mapped;
        }
      } else {
        const mapped = selected
          .map((val) => {
            const optionTemplate = appendFromAnswers.optionsMap?.[val];
            const extraVals = extra[val];
            // If option is a textarea-only (other), show only the value
            if (optionTemplate === "__EXTRA_INPUT__" && extraVals) {
              // Use first textarea value found
              const textVal = Object.values(extraVals).find((v): v is string => typeof v === "string" && v.trim().length > 0);
              return textVal ? textVal.trim() : "";
            }
            // If template has {var} placeholders, replace with extra input values
            if (optionTemplate && extraVals && /\{.+?\}/.test(optionTemplate)) {
              let result = optionTemplate;
              Object.entries(extraVals).forEach(([key, val]) => {
                result = result.replace(new RegExp(`\{${key}\}`, "g"), String(val));
              });
              return result;
            }
            // Otherwise, just show the label
            return optionTemplate || "";
          })
          .filter(Boolean)
          .join(appendFromAnswers.separator || " ");
        if (mapped) {
          appendedContent = content + mapped;
        }
      }
    }
  }

  return (
    <div 
      className={`alert ${variantClass} ${customClass}`.trim()}
      role="alert"
      aria-label={defaultAriaLabel}
    >
      {heading && (
        <HeadingTag className="alert-heading" dangerouslySetInnerHTML={{ __html: heading }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: appendedContent }} />
    </div>
  );
}
