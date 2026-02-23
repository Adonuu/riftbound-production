import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProductionPanel from './pages/ProductionPanel';
import Preview from './pages/Preview';
import Output from './pages/Output';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/output" element={<Output />} />
        <Route path="/*" element={
          <div className="app">
            <nav className="app-nav">
              <Link to="/">Control Panel</Link>
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
  );
}

export default App;
