import React from 'react';
import "../styles/Textarea.css";

const Textarea = ({ placeholder, value, onChange, error, name, required, rows = 4, className = '', ...props }) => {
  return (
    <div className={`textarea-wrapper ${className}`}>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        required={required}
        rows={rows}
        className={`textarea-field ${error ? 'textarea-error' : ''}`}
        {...props}
      />
      {error && <span className="textarea-error-message">{error}</span>}
    </div>
  );
};

export default Textarea;
