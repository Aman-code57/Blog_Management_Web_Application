import React from 'react';
import "../styles/LogoutModal.css";

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlayss">
      <div className="modals-contents">
        <h3>Confirm Logout</h3>
        <p>Are you sure you want to logout? This will end your session.</p>
        <div className="modals-actionss">
          <button className="btns-cancels" onClick={onClose}>Cancel</button>
          <button className="btns-confirms" onClick={onConfirm}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;
