# Admin Enhancements Plan

## Tasks
- [x] 1. UserManagement.jsx — Add Student Details Modal with Profile + Stats tabs
- [x] 2. Admin/Dashboard.jsx — Replace static metrics with real DB stats
- [x] 3. Admin/CodingSetter.jsx — Dynamic Add/Remove Hidden Test Cases
- [x] 4. Admin/AptitudeSetter.jsx — Bulk Batch Entry (20 questions, 4 sections)

## Details

### Task 1: UserManagement.jsx
- Add `selectedStudent` state and modal overlay
- Fetch student-specific data on row click
- Profile Tab: name, email, degree, year, language, career goal, weakness
- Stats Tab: Coding Score, Aptitude Score, Interview Score, ATS Score, Overall Readiness
- Add "View" icon in Actions column

### Task 2: Admin/Dashboard.jsx
- Fetch `problems` and `aptitude_questions` collections
- Replace metrics:
  - "Platform Status: Live" → "Total Coding Problems"
  - "Database Connection: Connected" → "Total Aptitude Questions"
  - Add "Avg Student Score"

### Task 3: Admin/CodingSetter.jsx
- Replace single hidden case with `hiddenCases` array state
- Add "Add Hidden Test Case" button
- Add "Remove" button per hidden case
- Submit all non-empty hidden cases

### Task 4: Admin/AptitudeSetter.jsx
- Redesign to batch builder with section tabs
- Sections: Logical, Reasoning, Grammar, Mathematics (5 each)
- Section progress counter
- "Deploy Full Batch" button with Promise.all

