import { useEffect } from 'react';
import './pages.css';

export default function Output() {
  useEffect(() => {
    document.title = 'Output';
  }, []);

  return (
    <div className="page-container centered fullscreen">
      <h1>OBS Output</h1>
    </div>
  );
}
