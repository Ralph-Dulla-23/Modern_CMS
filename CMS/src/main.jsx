import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Landingpage.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignUp from './pages/AccountManagement/signup/signup.jsx';
import Login from './pages/AccountManagement/login/login.jsx';
import Dashboard from './pages/Student/dashboard.jsx';
import AdminDashboard from './pages/Admin/Admindashboard.jsx';
import Reports from './pages/Admin/reports.jsx';
import SubmittedFormsManagement from './pages/Admin/SubmittedFormsManagement.jsx';
import Request from './pages/Student/request.jsx';
import Faculty from './pages/faculty/facultydash.jsx';
import ProfilePage from './pages/ui/Profile.jsx';
import Forms from './pages/faculty/forms.jsx';
import History from './pages/Admin/history.jsx';
import AProfile from './pages/Admin/adprofile.jsx';
import { ProfileProvider } from './pages/ui/ProfileContext.jsx';
import Schedule from './pages/Admin/schedule.jsx';
import ProtectedRoute from './firebase/ProtectedRoute.jsx';
import { Toaster } from 'sonner';

const router = createBrowserRouter([
  // --- Public Routes ---
  { path: "/", element: <App /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/login", element: <Login /> },

  // --- Student Routes ---
  { path: "/dashboard", element: <ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute> },
  { path: "/request", element: <ProtectedRoute allowedRoles={['student']}><Request /></ProtectedRoute> },
  { path: "/profile", element: <ProtectedRoute allowedRoles={['student', 'faculty']}><ProfilePage /></ProtectedRoute> },

  // --- Admin Routes ---
  { path: "/Admindashboard", element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute> },
  { path: "/SubmittedFormsManagement", element: <ProtectedRoute allowedRoles={['admin']}><SubmittedFormsManagement /></ProtectedRoute> },
  { path: "/reports", element: <ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute> },
  { path: "/schedule", element: <ProtectedRoute allowedRoles={['admin']}><Schedule /></ProtectedRoute> },
  { path: "/history", element: <ProtectedRoute allowedRoles={['admin']}><History /></ProtectedRoute> },
  { path: "/aprofile", element: <ProtectedRoute allowedRoles={['admin']}><AProfile /></ProtectedRoute> },

  // --- Faculty Routes ---
  { path: "/facultydash", element: <ProtectedRoute allowedRoles={['faculty']}><Faculty /></ProtectedRoute> },
  { path: "/forms", element: <ProtectedRoute allowedRoles={['faculty']}><Forms /></ProtectedRoute> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProfileProvider>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </ProfileProvider>
  </React.StrictMode>
);