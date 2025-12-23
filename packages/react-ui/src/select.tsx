import React, { useState } from "react";

interface SelectOption {
  label: string;
  value: string;
}

type HintLink = { type: "link"; text: string; href: string; target?: string };
type HintContent = string | HintLink;

interface SelectProps {
  id: string;
  label: string | string[] | HintContent[];
  optional?: boolean;
  hint?: string | string[] | HintContent[];
  successMessage?: string;
  errorMessage?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
}

export function Select(props: SelectProps) {
  const {
    id,
    label,
    optional = false,
    hint,
    successMessage,
    errorMessage,
    value = "",
    onChange,
    options,
    required = false,
  } = props;
  const [selectValue, setSelectValue] = useState(value);
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectValue(val);
    if (onChange) onChange(val);
    // Mark as touched once user selects
    if (!touched) {
      setTouched(true);
    }
  };

  const handleBlur = () => setTouched(true);

  const isValid = !required || selectValue !== "";

  // Generate default error messages if not provided
  const getErrorMessage = () => {
    if (errorMessage) return errorMessage;
    
    if (required && selectValue === "") {
      return "This field is required.";
    }
    return "Invalid selection.";
  };

  const showError = touched && !isValid;

  // Helper to render label/hint as text, list, or inline with links
  const renderTextOrList = (
    content: string | string[] | HintContent[] | undefined,
    className?: string,
    id?: string
  ) => {
    if (!content) return null;
    if (Array.isArray(content)) {
      // If all items are strings, treat as list (legacy)
      if (content.every((item) => typeof item === "string")) {
        return <ul className={className} id={id}>{(content as string[]).map((item, i) => <li key={i}>{item}</li>)}</ul>;
      }
      // Otherwise, treat as inline fragments (text + links)
      return (
        <span className={className} id={id}>
          {content.map((item, i) => {
            if (typeof item === "string") return <React.Fragment key={i}>{item}</React.Fragment>;
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
    return <span className={className} id={id}>{content}</span>;
  };
  return (
    <div className="qgds-select-wrapper">
      <label className={`qld-text-input-label${required ? " field-required" : ""}`} htmlFor={id}>
        {renderTextOrList(label)}
        {optional && <span className="label-text-optional"> (optional)</span>}
      </label>
      {hint && renderTextOrList(hint, "qld-hint-text", `${id}-hint`)}
      {touched && isValid && successMessage && (
        <div className="valid-feedback">{successMessage}</div>
      )}
      {showError && (
        <div className="invalid-feedback">{getErrorMessage()}</div>
      )}
      <select
        id={id}
        className={`form-select${showError ? " is-invalid" : ""}${touched && isValid ? " is-valid" : ""}`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        tabIndex={0}
        required={required}
        value={selectValue}
        onChange={handleChange}
        onBlur={handleBlur}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
