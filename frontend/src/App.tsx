import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ReactionTest from './pages/ReactionTest';
import AimTrainer from './pages/AimTrainer';
import NumberMemory from './pages/NumberMemory';
import VerbalMemory from './pages/VerbalMemory';
import SequenceMemory from './pages/SequenceMemory';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { useUser } from './hooks/useUser';
import './App.css';

function App() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test/reaction" element={<ReactionTest />} />
          <Route path="/test/aim" element={<AimTrainer />} />
          <Route path="/test/number-memory" element={<NumberMemory />} />
          <Route path="/test/verbal-memory" element={<VerbalMemory />} />
          <Route path="/test/sequence-memory" element={<SequenceMemory />} />
          <Route path="/results/:testType" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
