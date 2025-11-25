import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './pages/Register';
import Pass from './pages/Pass';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Scanner from './pages/admin/Scanner';
import { ToastProvider } from './components/ui/Toast';

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pass/:serialId" element={<Pass />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/scan" element={<Scanner />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </Router>
  );
};

export default App;