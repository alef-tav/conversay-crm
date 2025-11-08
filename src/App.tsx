import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Conversas from "./pages/Conversas";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = () => (
  <div className="flex w-full min-h-screen">
    <Sidebar />
    <main className="flex-1 overflow-auto">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agentes" element={<Index />} />
        <Route path="/conversas" element={<Conversas />} />
        <Route path="/metricas" element={<Index />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/configuracoes" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
