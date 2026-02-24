import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { OverlayProvider } from './context/OverlayContext';
import ProductionPanel from './pages/ProductionPanel';
import Preview from './pages/Preview';
import Output from './pages/Output';
import OverlayManager from './pages/OverlayManager';
import OverlayEditor from './pages/OverlayEditor';
import './App.css';

function App() {
  return (
    <OverlayProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/output" element={<Output />} />
          <Route path="/editor/:id" element={
            <div className="app">
              <nav className="app-nav">
                <Link to="/">Control Panel</Link>
                <Link to="/preview">Preview</Link>
                <Link to="/output">Output</Link>
              </nav>
              <OverlayEditor />
            </div>
          } />
          <Route path="/overlays" element={
            <div className="app">
              <nav className="app-nav">
                <Link to="/">Control Panel</Link>
                <Link to="/preview">Preview</Link>
                <Link to="/output">Output</Link>
              </nav>
              <OverlayManager />
            </div>
          } />
          <Route path="/*" element={
            <div className="app">
              <nav className="app-nav">
                <Link to="/">Control Panel</Link>
                <Link to="/overlays">Overlays</Link>
                <Link to="/preview">Preview</Link>
                <Link to="/output">Output</Link>
              </nav>
              <Routes>
                <Route path="/" element={<ProductionPanel />} />
                <Route path="/preview" element={<Preview />} />
              </Routes>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </OverlayProvider>
  );
}

export default App;
