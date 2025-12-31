import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ButtonGroupButton {
  text: string;
  link?: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
  action?: "navigate" | "submit" | "cancel";
  disabled?: boolean;
  requiresValidation?: boolean; // opt-in gating per button
  validateWhen?: Array<{ id: string; value: any }>;
}

interface ButtonGroupProps {
  buttons: ButtonGroupButton[];
  onValidate?: (button?: ButtonGroupButton) => boolean;
  onNavigateSuccess?: (link: string) => void; // Called when navigation happens after validation
  onSubmit?: () => Promise<void>; // Called when submit button is clicked
}

export function ButtonGroup({ buttons, onValidate, onNavigateSuccess, onSubmit }: ButtonGroupProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleClick = async (button: ButtonGroupButton) => {
    if (button.action === "navigate" && button.link) {
      // Only gate when this button opts-in to validation
      if (button.requiresValidation && onValidate && !onValidate(button)) {
        return;
      }
      // Call success callback before navigation
      if (onNavigateSuccess) {
        onNavigateSuccess(button.link);
      }
      navigate(button.link);
    } else if (button.action === "cancel" && button.link) {
      navigate(button.link);
    } else if (button.action === "submit" && onSubmit) {
      // Validate before submitting
      if (button.requiresValidation && onValidate && !onValidate(button)) {
        return;
      }
      try {
        setIsSubmitting(true);
        await onSubmit();
      } catch (error) {
        console.error("Submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isButtonDisabled = (button: ButtonGroupButton) => {
    // If button has explicit disabled flag, use it
    if (button.disabled !== undefined) {
      return button.disabled;
    }
    // Disable submit buttons while submitting
    if (button.action === "submit" && isSubmitting) {
      return true;
    }
    // If validation is required for this button, reflect disabled state
    if (button.requiresValidation && onValidate && (button.action === "navigate" || button.action === "submit") && button.link) {
      return !onValidate(button);
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
          {button.action === "submit" && isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Submitting...
            </>
          ) : (
            button.text
          )}
        </button>
      ))}
    </div>
  );
}
