import React, { useState } from 'react';
import './App.css';

// Import all necessary components
import Dashboard from './components/Dashboard';
import Insights from './components/Insights';
import HardwareControl from './components/HardwareControl';
import Automate from './components/Automate'; // Import the new Automate component

// Main App component for the Smart Plant Monitor UI
export default function App() {
  // State to manage the currently active navigation section.
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Function to toggle between light and dark mode
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark-mode');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-title">GrowSense 🌱</h1>
          <div className="navbar-links">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('insights')}
              className={`nav-button ${currentView === 'insights' ? 'active' : ''}`}
            >
              Insights & Chat
            </button>
            <button
              onClick={() => setCurrentView('hardwareControl')}
              className={`nav-button ${currentView === 'hardwareControl' ? 'active' : ''}`}
            >
              Controls
            </button>
            <button
              onClick={() => setCurrentView('automate')}
              className={`nav-button ${currentView === 'automate' ? 'active' : ''}`}
            >
              Automate
            </button>
            {/* Dark Mode Toggle */}
            <button onClick={toggleDarkMode} className="nav-icon-button">
              🌓
            </button>
            {/* Keeping other nav icons for consistency, though their click functionality is now handled by setCurrentView */}
            <button className="nav-icon-button" onClick={() => setCurrentView('insights')}>
                <i className="fa-solid fa-robot"></i>
            </button>
            <button className="nav-icon-button" onClick={() => setCurrentView('dashboard')}>
                <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Conditional Rendering of Components */}
      <main>
        {(() => {
          switch (currentView) {
            case 'dashboard':
              return <Dashboard />;
            case 'insights':
              return <Insights />;
            case 'hardwareControl':
              return <HardwareControl />;
            case 'automate': // Case for Automate component
              return <Automate />;
            default:
              return <Dashboard />; // Fallback to dashboard
          }
        })()}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 GrowSense. All rights reserved.</p>
      </footer>
    </div>
  );
}
