# Logout Confirmation Modal Integration

## Tasks
- [x] Update LogoutConfirmationModal.jsx to display logout confirmation text instead of delete
- [x] Integrate LogoutConfirmationModal in Profile.jsx
- [x] Integrate LogoutConfirmationModal in Homepage.jsx
- [x] Integrate LogoutConfirmationModal in CreateBlog.jsx
- [ ] Integrate LogoutConfirmationModal in BlogRead.jsx

## Details
- Change modal heading to "Confirm Logout"
- Update modal message to "Are you sure you want to logout? This will end your session."
- Remove blogTitle prop usage
- In each page, add showLogoutModal state, change logout button onClick to setShowLogoutModal(true), import modal, render modal with onConfirm={logout}
