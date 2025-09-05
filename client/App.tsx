import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MyIssues from "./pages/MyIssues";
import MyResolved from "./pages/MyResolved";

const queryClient = new QueryClient();

import { Layout } from "@/components/app/Layout";
import Admin from "./pages/Admin";
import Issues from "./pages/Issues";
import Contributions from "./pages/Contributions";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/contributions" element={<Contributions />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/my-issues" element={<MyIssues />} />
            <Route path="/my-resolved" element={<MyResolved />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
