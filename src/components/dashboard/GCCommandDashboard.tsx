// Re-export the full Contractors dashboard from its own module directory.
// This keeps the import path in Dashboard.tsx stable while the implementation
// lives in contractors/ alongside all its department sub-components.
export { default } from './contractors/GCCommandDashboard';
