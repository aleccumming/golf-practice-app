import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGate } from "./components/auth/AuthGate";
import { NavBar } from "./components/layout/NavBar";
import { LogPage } from "./pages/LogPage";
import { SessionsPage } from "./pages/SessionsPage";
import { PatternsPage } from "./pages/PatternsPage";
import { PlansPage } from "./pages/PlansPage";
import { PlanDetailPage } from "./pages/PlanDetailPage";
import { DrillsPage } from "./pages/DrillsPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SessionDetail } from "./components/sessions/SessionDetail";
import { useAuth } from "./hooks/useAuth";
import { useActiveSession } from "./hooks/useActiveSession";

function App() {
  const auth = useAuth();
  const activeSessionState = useActiveSession();

  return (
    <AuthGate auth={auth}>
      {auth.user && !auth.user.onboarding_completed_at ? (
        <OnboardingPage user={auth.user} onComplete={auth.setUser} />
      ) : (
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<LogPage activeSessionState={activeSessionState} />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/patterns" element={<PatternsPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/plans/:id" element={<PlanDetailPage />} />
            <Route path="/drills" element={<DrillsPage />} />
          </Routes>
        </BrowserRouter>
      )}
    </AuthGate>
  );
}

export default App;
