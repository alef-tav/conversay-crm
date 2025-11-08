import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Index from "./pages/Index";
import Agenda from "./pages/Agenda";
import Conversas from "./pages/Conversas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex w-full min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/agentes" element={<Index />} />
              <Route path="/conversas" element={<Conversas />} />
              <Route path="/metricas" element={<Index />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/configuracoes" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
