import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardEngine() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        console.log('Command Palette triggered');
        // TODO: Toggle command palette state in a future update
      }

      // Alt + D for Dashboard
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        navigate('/');
      }

      // Alt + Q for Quests
      if (e.altKey && e.key === 'q') {
        e.preventDefault();
        navigate('/quests');
      }

      // Alt + W for Wealth
      if (e.altKey && e.key === 'w') {
        e.preventDefault();
        navigate('/wealth');
      }

      // Alt + S for Stats
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        navigate('/stats');
      }
      
      // Alt + M for Mind
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        navigate('/mind');
      }
      
      // Alt + I for Intelligence
      if (e.altKey && e.key === 'i') {
        e.preventDefault();
        navigate('/intelligence');
      }

      // Alt + J for Jobs
      if (e.altKey && e.key === 'j') {
        e.preventDefault();
        navigate('/jobs');
      }

      // Alt + T for Travel
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        navigate('/travel');
      }

      // Alt + F for Forge
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        navigate('/forge');
      }

      // Alt + P for Profile
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        navigate('/profile');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
