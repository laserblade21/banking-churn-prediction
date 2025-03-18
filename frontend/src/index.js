// frontend/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';  // Assuming you're using Tailwind CSS
import './styles/custom.css';    // For any custom styles
import App from './App';

// Make sure the DOM is loaded before trying to access the root element
const rootElement = document.getElementById('root');

// Verify the root element exists before creating the React root
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Make sure index.html contains <div id='root'></div>");
}