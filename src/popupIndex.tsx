import React from 'react';
import { createRoot } from 'react-dom/client';
import PopupApp from './popupApp';  // a separate React component

const rootElement = document.getElementById('root');
const container = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<PopupApp />);
}
if (container) {
    const root = createRoot(container);
    root.render(<PopupApp />);
}

