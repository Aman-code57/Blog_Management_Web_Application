import React from 'react';
import "../styles/FileInput.css";

const FileInput = ({ label, accept, onChange, error, name, id, className = '', ...props }) => {
  return (
    <div className={`file-input-wrapper ${className}`}>
      {label && <label htmlFor={id} className="file-input-label">{label}</label>}
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        name={name}
        id={id}
        className={`file-input-field ${error ? 'file-input-error' : ''}`}
        {...props}
      />
      {error && <span className="file-input-error-message">{error}</span>}
    </div>
  );
};

export default FileInput;
