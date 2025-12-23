import React from "react";
import { useNavigate } from "react-router-dom";

interface ButtonProps {
  text: string;
  link: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
  size?: "sm" | "lg";
  customClass?: string;
}

export function Button({ 
  text, 
  link, 
  variant = "primary",
  size,
  customClass = ""
}: ButtonProps) {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(link);
  };
  
  const sizeClass = size ? `btn-${size}` : "";
  
  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${customClass}`.trim()}
      onClick={handleClick}
    >
      {text}
    </button>
  );
}
