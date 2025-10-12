import React from "react";
import "../styles/FormField.css";

const FormField = ({ label, htmlFor, children, error, className = '' }) => {
  return (
    <div className={`form-field ${className}`}>
      {label && <label htmlFor={htmlFor} className="form-field-label">{label}</label>}
      {children}
      {error && <span className="form-field-error">{error}</span>}
    </div>
  );
};

export default FormField;
