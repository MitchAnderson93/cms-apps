import React, { useState } from "react";

interface TextboxProps {
  id: string;
  label: string | string[];
  optional?: boolean;
  hint?: string | string[];
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

  // Helper to render label/hint as text or list
  const renderTextOrList = (content: string | string[] | undefined, className?: string, id?: string) => {
    if (!content) return null;
    if (Array.isArray(content)) {
      return <ul className={className} id={id}>{content.map((item, i) => <li key={i}>{item}</li>)}</ul>;
    }
    return <span className={className} id={id}>{content}</span>;
  };
  return (
    <div className="qgds-textbox-wrapper">
      <label className={`qld-text-input-label${required ? " field-required" : ""}`} htmlFor={id}>
        {renderTextOrList(label)}
        {optional && <span className="label-text-optional">(optional)</span>}
      </label>
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
