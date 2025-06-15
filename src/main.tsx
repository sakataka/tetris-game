import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

console.log('🎮 Simple Tetris Game initializing...');

function SimpleApp() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#00ffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎮 Cyberpunk Tetris</h1>
        <p>✅ React App is working!</p>
        <p>Environment: {import.meta.env.MODE}</p>
        <p>Production: {import.meta.env.PROD ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

console.log('🎯 Creating simple app...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

console.log('✅ Root element found, starting simple React app...');

try {
  createRoot(rootElement).render(
    <StrictMode>
      <SimpleApp />
    </StrictMode>
  );
  console.log('🚀 Simple React app rendered successfully!');
} catch (error) {
  console.error('❌ Simple React app render failed:', error);
  throw error;
}
