// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import DashboardLayout from './layouts/DashboardLayout';
import Chat from './pages/Chat'; // <-- 1. Import the new Chat component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* 2. Swap out WelcomeView for the real Chat component */}
          <Route index element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;