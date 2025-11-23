import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import './App.css';

function App() {
  return (
    <div style={{ paddingTop: '80px' }}> {/* Ajuste para header fixed */}
      <Header />
      <Hero />
    </div>
  );
}

export default App;
