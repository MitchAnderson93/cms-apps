import React from "react";
import { useNavigate } from "react-router-dom";

interface ButtonGroupButton {
  text: string;
  link?: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
  action?: "navigate" | "submit" | "cancel";
  disabled?: boolean;
  requiresValidation?: boolean; // opt-in gating per button
}

interface ButtonGroupProps {
  buttons: ButtonGroupButton[];
  onValidate?: () => boolean;
  onNavigateSuccess?: (link: string) => void; // Called when navigation happens after validation
}

export function ButtonGroup({ buttons, onValidate, onNavigateSuccess }: ButtonGroupProps) {
  const navigate = useNavigate();
  
  const handleClick = (button: ButtonGroupButton) => {
    if (button.action === "navigate" && button.link) {
      // Only gate when this button opts-in to validation
      if (button.requiresValidation && onValidate && !onValidate()) {
        return;
      }
      // Call success callback before navigation
      if (onNavigateSuccess) {
        onNavigateSuccess(button.link);
      }
      navigate(button.link);
    } else if (button.action === "cancel" && button.link) {
      navigate(button.link);
    }
  };
  
  const isButtonDisabled = (button: ButtonGroupButton) => {
    // If button has explicit disabled flag, use it
    if (button.disabled !== undefined) {
      return button.disabled;
    }
    // If validation is required for this button, reflect disabled state
    if (button.requiresValidation && onValidate && button.action === "navigate" && button.link) {
      return !onValidate();
    }
    return false;
  };
  
  return (
    <div className="button-group mt-4">
      {buttons.map((button, index) => (
        <button
          key={index}
          type="button"
          className={`btn btn-${button.variant || "secondary"} me-2`}
          onClick={() => handleClick(button)}
          disabled={isButtonDisabled(button)}
        >
          {button.text}
        </button>
      ))}
    </div>
  );
}
