import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import CalendarPage from "@/pages/CalendarPage";
import ReservePage from "@/pages/ReservePage";
import AuditPage from "@/pages/AuditPage";
import SetupPage from "@/pages/SetupPage";
import RevokePage from "@/pages/RevokePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/reserve" element={<ReservePage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/revoke" element={<RevokePage />} />
        </Route>
      </Routes>
    </Router>
  );
}
