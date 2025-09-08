import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AuthLanding from "./pages/AuthLanding";
import MyIssues from "./pages/MyIssues";
import MyResolved from "./pages/MyResolved";

const queryClient = new QueryClient();

import { Layout } from "@/components/app/Layout";
import Issues from "./pages/Issues";
import Contributions from "./pages/Contributions";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import OtpVerify from "./pages/OtpVerify";
import Signup from "./pages/Signup";
import SignupUser from "./pages/SignupUser";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminDepartments from "./pages/admin/Departments";
import AdminIssues from "./pages/admin/Issues";
import AdminLeaderboards from "./pages/admin/Leaderboards";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminNotifications from "./pages/admin/Notifications";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const uid = typeof window !== 'undefined' ? localStorage.getItem('uid') : null;
  if (!uid) return <Navigate to="/" replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<AuthLanding />} />
            <Route path="/UserPage" element={<RequireAuth><Index /></RequireAuth>} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/issues" element={<RequireAuth><Issues /></RequireAuth>} />
            <Route path="/contributions" element={<RequireAuth><Contributions /></RequireAuth>} />
            <Route path="/gallery" element={<RequireAuth><Gallery /></RequireAuth>} />
            <Route path="/my-issues" element={<RequireAuth><MyIssues /></RequireAuth>} />
            <Route path="/my-resolved" element={<RequireAuth><MyResolved /></RequireAuth>} />
            <Route path="/otp" element={<OtpVerify />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/user" element={<SignupUser />} />
            <Route path="/Admin" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="issues" element={<AdminIssues />} />
              <Route path="leaderboards" element={<AdminLeaderboards />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
