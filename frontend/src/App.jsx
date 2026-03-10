import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import SettingsModal from './components/SettingsModal';
import GeneticsCalculator from './pages/GeneticsCalculator';

function App() {
  const [config, setConfig] = useState(null);
  const [species, setSpecies] = useState('cat');
  const [showSettings, setShowSettings] = useState(false);
  const [activeGenes, setActiveGenes] = useState({ parent1: [], parent2: [] });

  const fetchConfig = async () => {
    try {
      const res = await axios.get('/api/config');
      setConfig(res.data);
      if (!res.data.species[species] && res.data.defaultSpecies) {
        setSpecies(res.data.defaultSpecies);
      }
    } catch (err) {
      console.error('無法取得基因設定檔，請確認後端是否啟動');
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <BrowserRouter>
      <SettingsModal 
        showSettings={showSettings} 
        setShowSettings={setShowSettings} 
        config={config} 
        setConfig={setConfig} 
        species={species} 
        setActiveGenes={setActiveGenes}
      />
      
      <Layout 
        config={config} 
        species={species} 
        setSpecies={setSpecies} 
        openSettings={() => setShowSettings(true)}
      >
        <Routes>
          <Route path="/" element={
            <GeneticsCalculator 
              config={config} 
              species={species} 
              activeGenes={activeGenes} 
              setActiveGenes={setActiveGenes} 
            />
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
