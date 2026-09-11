# Enterprise Excel Export System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure, backend-driven Enterprise Excel Export System for the Grey Fabric Costing software with role-based and granular permission controls, professional multi-sheet `.xlsx` generation using `exceljs`, export audit logging, a dedicated Export Data Center, an interactive top navbar export modal, and filtered exports across Costing History and Reports.

**Architecture:** Express REST API endpoints in `/api/exports/*` with JWT authentication and granular permission middleware (`COSTING_EXPORT`, `PRODUCTION_EXPORT`, `YARN_EXPORT`, `FABRIC_EXPORT`, `CHARGES_EXPORT`, `USER_EXPORT`, `REPORT_EXPORT`). Multi-sheet Excel workbook generator with `exceljs` applying dark/orange theme styling, auto-widths, frozen panes, and custom number formats. Export audit logging in SQLite. Frontend Export Center (`/export-data`), Navbar Export Modal, filter-aware Costing History exports, and Users & Roles permissions management.

**Tech Stack:** Node.js, Express, SQLite (`better-sqlite3`), `exceljs`, React 19, Tailwind CSS, Lucide Icons.

## Global Constraints
- Preserve existing dark black/charcoal UI with orange accent colors (`#FF6B00`, `#E65100`, `#14151B`, `#1E2028`).
- Backend-generated exports only; frontend never directly queries or dumps unrestricted database data.
- Strict security: Passwords, password hashes, JWT tokens, and secrets must NEVER be present in any export.
- Granular permissions: Admins have full access; Staff permissions are checked per module. Missing permission returns HTTP 403 Forbidden.
- Unconstrained exports: Exports include all database records matching active search and date filters, ignoring frontend UI pagination.

---

### Task 1: Backend Dependencies & Database Migration
**Files:**
- Modify: `backend/package.json`
- Create: `backend/src/database/migrations/003_export_system_and_permissions.sql`
- Modify: `backend/src/models/User.js`
- Create: `backend/src/models/ExportLog.js`

- [ ] **Step 1: Install `exceljs`**
- [ ] **Step 2: Create SQLite migration `003_export_system_and_permissions.sql` with `export_logs` table and `permissions` column in `users`**
- [ ] **Step 3: Update `User.js` to handle JSON serialized permissions**
- [ ] **Step 4: Create `ExportLog.js` model for audit trail**

---

### Task 2: Permission Middleware & User Controller Updates
**Files:**
- Create: `backend/src/middleware/permissionMiddleware.js`
- Modify: `backend/src/middleware/authMiddleware.js`
- Modify: `backend/src/controllers/userController.js`

- [ ] **Step 1: Implement `permissionMiddleware.js` with `requirePermission(permission)`**
- [ ] **Step 2: Populate `req.user.permissions` in `authMiddleware.js`**
- [ ] **Step 3: Update `userController.update` to accept and persist user permissions**

---

### Task 3: Excel Styling Engine & Domain Export Generators
**Files:**
- Create: `backend/src/services/export/exportFormatter.js`
- Create: `backend/src/services/export/excelExportService.js`
- Create: `backend/src/services/export/costingExport.js`
- Create: `backend/src/services/export/productionExport.js`
- Create: `backend/src/services/export/yarnExport.js`
- Create: `backend/src/services/export/fabricExport.js`
- Create: `backend/src/services/export/chargesExport.js`
- Create: `backend/src/services/export/userExport.js`

- [ ] **Step 1: Build `exportFormatter.js` styling rules (headers, fills, currencies, column widths)**
- [ ] **Step 2: Build `costingExport.js` with Sheet 1 (Summary), Sheet 2 (Calculations), Sheet 3 (Inputs & Assumptions)**
- [ ] **Step 3: Build `productionExport.js` for yarn-to-fabric and fabric-to-yarn plans**
- [ ] **Step 4: Build `yarnExport.js`, `fabricExport.js`, `chargesExport.js`, and `userExport.js` (safe fields only)**
- [ ] **Step 5: Assemble `excelExportService.js` orchestrator**

---

### Task 4: Export Controller & REST Routes
**Files:**
- Create: `backend/src/controllers/exportController.js`
- Create: `backend/src/routes/exportRoutes.js`
- Modify: `backend/src/app.js`
- Create: `backend/tests/export.test.js`

- [ ] **Step 1: Implement `exportController.js` endpoints with filtering and logging**
- [ ] **Step 2: Define `exportRoutes.js` with permission guards**
- [ ] **Step 3: Mount `/api/exports` in `app.js`**
- [ ] **Step 4: Write and run unit test `backend/tests/export.test.js`**

---

### Task 5: Frontend Export Service & Navbar Export Modal
**Files:**
- Create: `frontend/src/services/exportService.js`
- Create: `frontend/src/components/export/ExportModal.jsx`
- Modify: `frontend/src/components/layout/Header.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Build `exportService.js` blob downloader with authorization headers**
- [ ] **Step 2: Build `ExportModal.jsx` with data type, date range, and format selection**
- [ ] **Step 3: Connect Header `Export` button to launch `ExportModal`**

---

### Task 6: Dedicated Export Data Center (`/export-data`)
**Files:**
- Create: `frontend/src/pages/ExportCenter.jsx`
- Modify: `frontend/src/components/layout/Sidebar.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create `ExportCenter.jsx` with data type cards, dynamic filters, live record counts, and audit logs**
- [ ] **Step 2: Connect Sidebar `Export Data` link to `ExportCenter`**

---

### Task 7: Costing History & Reports Export Integration
**Files:**
- Modify: `frontend/src/pages/CostingHistory.jsx`
- Modify: `frontend/src/pages/Reports.jsx`
- Modify: `frontend/src/pages/ProductionReports.jsx`

- [ ] **Step 1: Add `Export Excel` and `Export CSV` to `CostingHistory.jsx` with live query filters**
- [ ] **Step 2: Connect `Reports.jsx` and `ProductionReports.jsx` to backend Excel export endpoints**

---

### Task 8: User Permissions Management in Administration
**Files:**
- Modify: `frontend/src/pages/Users.jsx`

- [ ] **Step 1: Add permission toggles to User Edit Modal**
- [ ] **Step 2: Connect to backend update endpoint and update current session capabilities**
