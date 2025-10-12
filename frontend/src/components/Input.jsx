import React from 'react';
import "../styles/Input.css";

const Input = ({ type = 'text', placeholder, value, onChange, onBlur, error, name, required, className = '', ...props }) => {
  return (
    <div className={`input-wrapper ${className}`}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        required={required}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
