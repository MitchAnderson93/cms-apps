
import React, { useState } from "react";

type HintLink = { type: "link"; text: string; href: string; target?: string };
type HintContent = string | HintLink;

interface LabelList {
  heading: string;
  list: (string | HintLink)[];
  intro?: string;
}

interface TextboxProps {
  id: string;
  label: string | string[] | HintContent[] | LabelList;
  optional?: boolean;
  hint?: string | string[] | HintContent[];
  successMessage?: string;
  errorMessage?: string;
  value?: string;
  onChange?: (value: string) => void;
  minChars?: number;
  maxChars?: number;
  required?: boolean;
  type?: "text" | "number";
  placeholder?: string;
  pattern?: string;
}

export function Textbox(props: TextboxProps) {
  const {
    id,
    label,
    optional = false,
    hint,
    successMessage,
    errorMessage,
    value = "",
    onChange,
    minChars,
    maxChars,
    required = false,
    type = "text",
    placeholder = "",
    pattern
  } = props;
  const [inputValue, setInputValue] = useState(value);
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Filter input based on pattern
    if (pattern === "[0-9]*" && val) {
      // Only allow numeric characters
      val = val.replace(/[^0-9]/g, "");
    }
    
    setInputValue(val);
    if (onChange) onChange(val);
    // Mark as touched once user starts typing
    if (!touched && val.length > 0) {
      setTouched(true);
    }
  };

  const handleBlur = () => setTouched(true);

  const isValid = (
    (!required || inputValue.length > 0) &&
    (minChars === undefined || inputValue.length >= minChars) &&
    (maxChars === undefined || inputValue.length <= maxChars)
  );

  // Generate default error messages if not provided
  const getErrorMessage = () => {
    if (errorMessage) return errorMessage;
    
    if (required && inputValue.length === 0) {
      return " This field is required.";
    }
    if (maxChars && inputValue.length > maxChars) {
      return `Maximum ${maxChars} characters allowed.`;
    }
    if (minChars && inputValue.length < minChars) {
      return `Minimum ${minChars} characters required.`;
    }
    return "Invalid input.";
  };

  const showError = touched && !isValid;
  const charCount = inputValue.length;
  const isNearLimit = maxChars && charCount >= maxChars * 0.9;

  // Helper to render label/hint as text, list, or inline with links
  const renderTextOrList = (
    content: string | string[] | HintContent[] | undefined,
    className?: string,
    id?: string
  ): React.ReactNode => {
    if (!content) return null;
    if (Array.isArray(content)) {
      // If all items are strings, treat as list (legacy)
      if (content.every((item) => typeof item === "string")) {
        return (
          <ul className={className} id={id}>
            {(content as string[]).map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        );
      }
      // Otherwise, treat as inline fragments (text + links + nested lists)
      return (
        <span className={className} id={id}>
          {(content as (string | HintLink | any[])[]).map((item, i) => {
            if (typeof item === "string") return <React.Fragment key={i}>{item}</React.Fragment>;
            if (Array.isArray(item)) {
              // Nested list
              return (
                <ul key={i}>
                  {item.map((li, j) => <li key={j}>{typeof li === "string" ? li : renderTextOrList(li)}</li>)}
                </ul>
              );
            }
            if (item && typeof item === "object" && item.type === "link") {
              return (
                <a
                  key={i}
                  href={item.href}
                  target={item.target || "_blank"}
                  rel="noopener noreferrer"
                  className="qld-hint-link"
                >
                  {item.text}
                </a>
              );
            }
            return null;
          })}
        </span>
      );
    }
    if (typeof content === "object" && (content as HintLink).type === "link") {
      const link = content as HintLink;
      return (
        <a
          href={link.href}
          target={link.target || "_blank"}
          rel="noopener noreferrer"
          className="qld-hint-link"
        >
          {link.text}
        </a>
      );
    }
    // fallback for string
    return <span className={className} id={id}>{content as string}</span>;
  };
  return (
    <div className="qgds-textbox-wrapper">
      <div className={`qld-text-input-label${required ? " field-required" : ""}`}>
        {(() => {
          if (typeof label === "object" && label && "heading" in label && "list" in label) {
            // Render advanced label (LabelList)
            return <>
              {required ? " " : ""}{label.heading}
              {label.intro && <span className="qld-hint-text">{label.intro}</span>}
              {label.list && label.list.length > 0 && (
                <ul className="pl-20">
                  {label.list.map((item, i) =>
                    typeof item === "string" ? (
                      <li key={i}>{item}</li>
                    ) : (
                      <li key={i}>
                        <a
                          href={item.href}
                          target={item.target || "_blank"}
                          rel="noopener noreferrer"
                          className="qld-hint-link"
                        >
                          {item.text}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              )}
            </>;
          }
          // For string or array label, add space if required
          if (typeof label === "string") {
            return (required ? " " : "") + label;
          }
          if (Array.isArray(label)) {
            return (required ? " " : "") + label.join(" ");
          }
          return renderTextOrList(label);
        })()}
        {optional && <span className="label-text-optional">(optional)</span>}
      </div>
      {hint && renderTextOrList(hint, "qld-hint-text", `${id}-hint`)}
      <input
        id={id}
        className={`form-control${showError ? " is-invalid" : ""}${touched && isValid ? " is-valid" : ""}`}
        type={type}
        placeholder={placeholder}
        tabIndex={0}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
        aria-invalid={showError}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={maxChars}
        minLength={minChars}
        pattern={pattern}
        inputMode={pattern === "[0-9]*" ? "numeric" : undefined}
      />
      {maxChars && (
        <div className={`mt-2 character-count ${isNearLimit ? "text-danger" : ""} ${charCount > maxChars ? "text-danger" : ""}`}>
          {charCount}/{maxChars} characters
        </div>
      )}
      {touched && isValid && successMessage && (
        <div className="mt-2 valid-feedback d-block">{successMessage}</div>
      )}
      {showError && (
        <div className="mt-2 invalid-feedback d-block">{getErrorMessage()}</div>
      )}
    </div>
  );
}
