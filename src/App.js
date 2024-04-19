import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DirectChat from './DirectChat';
import GroupChat from './GroupChat';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/direct-chat">Direct Chat</Link></li>
            <li><Link to="/group-chat">Group Chat</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/direct-chat" element={<DirectChat />} />
          <Route path="/group-chat" element={<GroupChat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
