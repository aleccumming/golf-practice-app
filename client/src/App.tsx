import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGate } from "./components/auth/AuthGate";
import { NavBar } from "./components/layout/NavBar";
import { LogPage } from "./pages/LogPage";
import { SessionsPage } from "./pages/SessionsPage";
import { PatternsPage } from "./pages/PatternsPage";
import { PlansPage } from "./pages/PlansPage";
import { PlanDetailPage } from "./pages/PlanDetailPage";
import { DrillsPage } from "./pages/DrillsPage";
import { SessionDetail } from "./components/sessions/SessionDetail";
import { CompassPrototype } from "./dev/CompassPrototype";

function App() {
  return (
    <AuthGate>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<LogPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/patterns" element={<PatternsPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/:id" element={<PlanDetailPage />} />
          <Route path="/drills" element={<DrillsPage />} />
          <Route path="/dev/compass" element={<CompassPrototype />} />
        </Routes>
      </BrowserRouter>
    </AuthGate>
  );
}

export default App;
