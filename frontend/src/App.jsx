import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HomeDashboard from './pages/HomeDashboard';
import MarksEntry from './pages/MarksEntry';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<HomeDashboard />} />
            <Route path="marks" element={<MarksEntry />} />
            <Route path="verify" element={<div className="p-4 bg-white rounded shadow text-center">Verification Component coming soon...</div>} />
            <Route path="reports" element={<div className="p-4 bg-white rounded shadow text-center">Reports Component coming soon...</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
