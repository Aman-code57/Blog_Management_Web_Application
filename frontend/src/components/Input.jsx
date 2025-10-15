import React from 'react';
import "../styles/Input.css";

const Input = React.forwardRef(({ type = 'text', placeholder, value, onChange, onBlur, error, name, required, className = '', ...props }, ref) => {
  return (
    <div className={`input-wrapper ${className}`}>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
});

export default Input;
