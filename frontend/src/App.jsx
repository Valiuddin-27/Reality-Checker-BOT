import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Add the exact file extensions here:
import Auth from "./pages/auth.jsx";
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Chat from "./pages/chat.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;