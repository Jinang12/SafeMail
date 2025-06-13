import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavigationBar from './components/Navbar';
import Home from './components/Home';
import SMSScan from './components/SMSScan';
import Services from './components/Services';
import About from './components/About';
import Reviews from './components/Reviews';

function App() {
  return (
    <Router>
      <div className="app-container">
        <NavigationBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<SMSScan />} />
            <Route path="/services" element={<Services />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>© 2024 SafeMail - Protect Your Messages</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
