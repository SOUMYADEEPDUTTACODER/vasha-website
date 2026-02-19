import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import DevDocs from "./pages/DevDocs";
import UserDocs from "./pages/UserDocs";
import EvaluationPlots from "./pages/EvaluationPlots";
import ChromeExtension from "./pages/ChromeExtension";
import NotFound from "./pages/NotFound";
import MT from "./pages/MT";
import TTS from "./pages/TTS";
import TextChat from "./pages/TextChat";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useEffect } from "react";

import { GoogleOAuthProvider } from "@react-oauth/google";
// Get Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

import { BackendStatusBanner } from "@/components/BackendStatusBanner";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    console.log("App component mounted");
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vasha-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BackendStatusBanner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/docs/dev" element={<DevDocs />} />
                <Route path="/mt" element={<MT />} />
                <Route path="/tts" element={<TTS />} />
                <Route path="/text-chat" element={<TextChat />} />
                <Route path="/docs/user" element={<UserDocs />} />
                <Route path="/evaluation-plots" element={<EvaluationPlots />} />
                <Route path="/chrome-extension" element={<ChromeExtension />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignupForm />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
