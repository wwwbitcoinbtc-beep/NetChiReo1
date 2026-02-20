import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

function mountApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      // If root is not yet available, wait for DOMContentLoaded and try again
      document.addEventListener('DOMContentLoaded', () => mountApp(), { once: true });
      return;
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    // Surface mount errors into the page and console to help debugging in the browser
    // (keeps the page from silently staying blank)
    // eslint-disable-next-line no-console
    console.error('App mount error:', err);
    const pre = document.createElement('pre');
    pre.style.color = 'red';
    pre.style.whiteSpace = 'pre-wrap';
    pre.textContent = `App mount error: ${err instanceof Error ? err.message : String(err)}`;
    document.body && document.body.insertBefore(pre, document.body.firstChild);
  }
}

mountApp();