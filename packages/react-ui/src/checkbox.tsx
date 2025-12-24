import React from "react";


interface CheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  required?: boolean;
}

export function Checkbox({ id, label, checked = false, onChange, required = false }: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };
  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        required={required}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}

export interface CheckboxOption {
  id: string;
  label: string;
  value?: string;
  checked?: boolean;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  name: string;
  label: string;
  options: CheckboxOption[];
  hint?: string;
  error?: string;
  success?: string;
  required?: boolean;
  optional?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  name,
  label,
  options,
  hint,
  error,
  success,
  required = false,
  optional = false,
  onChange,
  className = "",
}) => {
  return (
    <div className={className}>
      <div className={`mb-4 qld-text-input-label${required ? " field-required" : ""}`.trim()}>
        {label}
        {optional && <span className="label-text-optional">(Optional)</span>}
      </div>
      {hint && <span className="qld-hint-text">{hint}</span>}
      {success && <div className="valid-feedback">{success}</div>}
      {error && <div className="invalid-feedback">{error}</div>}
      {options.map((option) => (
        <div className="form-check " key={option.id}>
          <input
            className="form-check-input"
            type="checkbox"
            name={name}
            id={option.id}
            value={option.value}
            tabIndex={0}
            checked={option.checked}
            disabled={option.disabled}
            onChange={onChange}
          />
          <label className="form-check-label" htmlFor={option.id}>
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

