import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MyIssues from "./pages/MyIssues";
import MyResolved from "./pages/MyResolved";

const queryClient = new QueryClient();

import { Layout } from "@/components/app/Layout";
import Admin from "./pages/Admin";
import Issues from "./pages/Issues";
import Contributions from "./pages/Contributions";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import OtpVerify from "./pages/OtpVerify";
import Signup from "./pages/Signup";
import SignupUser from "./pages/SignupUser";
import SignupAdmin from "./pages/SignupAdmin";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const uid = typeof window !== 'undefined' ? localStorage.getItem('uid') : null;
  if (!uid) return <Navigate to="/login" replace />;
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
            <Route path="/" element={<Index />} />
            <Route path="/issues" element={<RequireAuth><Issues /></RequireAuth>} />
            <Route path="/contributions" element={<RequireAuth><Contributions /></RequireAuth>} />
            <Route path="/gallery" element={<RequireAuth><Gallery /></RequireAuth>} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/my-issues" element={<MyIssues />} />
            <Route path="/my-resolved" element={<MyResolved />} />
            <Route path="/login" element={<Login />} />
            <Route path="/otp" element={<OtpVerify />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/user" element={<SignupUser />} />
            <Route path="/signup/admin" element={<SignupAdmin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
