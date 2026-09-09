import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './features/auth/authSlice';
import { Login } from './features/auth/Login';
import { Layout } from './components/layout/Layout';

const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const EmployeeList = lazy(() => import('./features/employees/EmployeeList').then(module => ({ default: module.EmployeeList })));
const EmployeeDetails = lazy(() => import('./features/employees/EmployeeDetails').then(module => ({ default: module.EmployeeDetails })));
const Analytics = lazy(() => import('./features/analytics/Analytics').then(module => ({ default: module.Analytics })));
const AuditLog = lazy(() => import('./features/audit/AuditLog').then(module => ({ default: module.AuditLog })));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-slate-50 p-6 text-slate-500">Loading application...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/:id" element={<EmployeeDetails />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="audit" element={<AuditLog />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
