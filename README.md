# CERN Database Management Web Application Walkthrough

A formal, production-quality CERN Data Management web application built with **React, TypeScript, Vite, and Tailwind CSS**. Designed specifically around the **CERN Data Bookkeeping Service (DBS3 / dbs2go)** data architecture.

---

## Key Achievements

### 1. Dedicated Right-Side Hierarchy Panel (Ancestry Tree)
- Implemented in `RightHierarchyPanel.tsx` and `HierarchyNode.tsx`.
- Displays the complete parent ancestry chain (e.g., `Primary Dataset` $\rightarrow$ `Acquisition Era` $\rightarrow$ `Dataset` $\rightarrow$ `Block` $\rightarrow$ `File`).
- **Interactive Parent Traversal**: Clicking any parent or ancestor node in the tree sets that node as the active entity, fetches its live data from the backend API, displays its metadata in the main view, and updates the ancestry hierarchy dynamically.
- Includes expand/collapse toggles, entity-specific icons, selected node highlighting, keyboard accessibility (`Enter`/`Space`), long-path truncation with hover tooltips, scrollable overflow, loading skeletons, and error retry states.

### 2. Strict No-Mock-Data Architecture
- **Zero Mock Data Policy**: Does not fabricate fake CERN experiment names, sample filenames, or dummy JSON responses.
- **Formal Empty State**: When `VITE_API_BASE_URL` is unconfigured or unreachable, the center area renders `NoDataSourceState.tsx`, which explicitly states **"No data source connected"** and details the required CERN DBS3 REST endpoints.
- **Interactive Connection Modal**: Users can test and connect to live CERN DBS reader instances (e.g. `https://cmsweb.cern.ch/dbs/prod/global/DBSReader`) or local proxy services (`http://localhost:8000/api`) with instant health check pinging (`/serverinfo`).

### 3. Institutional Scientific UI Design
- Styled with clean slate/blue color palette, high information density, and monospace font for logical file names (LFNs) and hashes.
- Includes a restrained top header with CERN branding, status badge, search bar, and DBS instance selector (`prod/global`, `prod/phys01`, `prod/phys02`, `prod/phys03`).
- Center Data Viewer (`MainDataViewer.tsx`) features:
  - **Entity Header Banner**: Entity name, path, status, and direct parent link.
  - **Metadata Grid**: Displays system key/value properties returned by the API. Only fields present in the response are rendered.
  - **Data Preview Table**: Tabular view of blocks/files associated with the entity.
  - **JSON Payload Inspector**: Formatted raw JSON viewer with copy-to-clipboard functionality.

---

## Verification Results

### Automated Build Verification
- Executed `npm run build` (`tsc -b && vite build`).
- Compiles cleanly with zero errors across 1,591 modules.

```bash
dist/index.html                   0.98 kB │ gzip:  0.54 kB
dist/assets/index-B-8Cc56_.css   34.79 kB │ gzip:  6.71 kB
dist/assets/index-SJ874pTj.js   204.26 kB │ gzip: 60.62 kB
✓ built in 4.07s
```

---

## Acceptance Criteria Checklist

| Requirement | Status | Note |
| :--- | :---: | :--- |
| React + TypeScript + Vite | **PASS** | React 18, Vite 6, Strict TypeScript |
| Formal Scientific UI | **PASS** | CERN institutional layout with dark slate theme |
| Main Data Viewer | **PASS** | Metadata grid, tabular preview, and JSON inspector |
| Right-Side Hierarchy Tree | **PASS** | Ancestry tree with expand/collapse & node highlight |
| Driven by Backend Data | **PASS** | `dbsService.ts` queries real DBS endpoints |
| Parent Nodes Clickable | **PASS** | Clicking parent node updates main view & hierarchy |
| No Mock Data Displayed | **PASS** | Honest "No data source connected" empty state |
| API Base URL via `.env` | **PASS** | `VITE_API_BASE_URL` with runtime modal fallback |
| Robust Error & Loading States | **PASS** | Spinners, error banners, and retry controls |
| Desktop Responsive | **PASS** | Tested layout at 1440px+ and laptop resolutions |
