import React from 'react';
import { TailSpin } from "react-loader-spinner";
import "../styles/DeleteModal.css";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, blogTitle, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete the blog "<strong>{blogTitle}</strong>"? This action cannot be undone.</p>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0' }}>
            <span style={{ color: '#333' }}>Deleting...</span>
            <TailSpin height="20" width="20" color="#333" ariaLabel="loading" style={{ marginTop: '5px' }}/>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-confirm" onClick={onConfirm} disabled={loading}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
