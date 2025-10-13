# TODO: Add Blog Created Date Display

## Backend Changes
- [x] Add created_at field to Blog model in backend/models/blogs.py
- [x] Update BlogOut schema in backend/schemas/blogs_schema.py to include created_at
- [x] Ensure API endpoints in backend/api/blogs.py return created_at in responses

## Frontend Changes
- [x] Update Homepage.jsx to display created_at in blog cards
- [x] Update Homepage.jsx to display created_at in blog read container

## Followup Steps
- [ ] Run database migrations or recreate the database to apply the new column
- [ ] Test the backend API to ensure created_at is returned
- [ ] Test the frontend to verify the date displays correctly
- [ ] Format the date in frontend for better readability (e.g., using toLocaleDateString())
