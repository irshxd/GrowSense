import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // or App.tsx
import './App.css'; // <--- Make sure this line is present and points to App.css

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);