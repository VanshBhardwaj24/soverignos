import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import Stats from './pages/Stats';
import Wealth from './pages/Wealth';
import Mind from './pages/Mind';
import Jobs from './pages/Jobs';
import Travel from './pages/Travel';
import Settings from './pages/Settings';
import Marketplace from './pages/Marketplace';
import BusinessForge from './pages/BusinessForge';
import Punishments from './pages/Punishments';
import Analytics from './pages/Analytics';
import SundayProtocol from './pages/SundayProtocol';
import { useSovereignStore } from './store/sovereign';
import { useEffect } from 'react';
import { AuthOverlay } from './components/auth/AuthOverlay';
import { Toaster, toast } from 'sonner';
import { Calendar } from 'lucide-react';

function App() {
  const { resetDailyQuests } = useSovereignStore();

  useEffect(() => {
    // Immediate check on mount
    resetDailyQuests();

    // Check periodically for the midnight transition
    const interval = setInterval(() => {
      resetDailyQuests();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [resetDailyQuests]);

  // Sunday Protocol Reminder
  useEffect(() => {
    const isSunday = new Date().getDay() === 0;
    if (isSunday) {
      toast.info('COMMANDER, THE SUNDAY PROTOCOL IS ACTIVE', {
        description: 'Weekly reflection is mandatory for accountability.',
        icon: <Calendar className="text-blue-400" size={18} />,
        duration: 8000,
      });
    }
  }, []);

  return (
    <AuthOverlay>
      <BrowserRouter>
        <Toaster richColors closeButton theme="dark" position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/wealth" element={<Wealth />} />
            <Route path="/mind" element={<Mind />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/forge" element={<BusinessForge />} />
            <Route path="/punishments" element={<Punishments />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/sunday" element={<SundayProtocol />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthOverlay>
  );
}

export default App;
