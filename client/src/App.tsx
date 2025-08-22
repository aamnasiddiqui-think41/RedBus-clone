
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router/Routes';
import { AuthInitializer } from './components/auth/AuthInitializer';

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <AppRoutes />
      </AuthInitializer>
    </BrowserRouter>
  );
}

export default App;
