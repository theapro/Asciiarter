import { AppShell } from "./components/layout/AppShell";
import { AsciiDashboard } from "./features/ascii/AsciiDashboard";

export default function App() {
  return (
    <AppShell>
      <AsciiDashboard />
    </AppShell>
  );
}
