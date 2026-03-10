import { Dna, Settings } from 'lucide-react';
import { cn } from '../utils/genetics';

export default function Layout({ config, species, setSpecies, openSettings, children }) {
  if (!config) return null;

  return (
    <div className="app-container min-vh-100 py-4 text-light position-relative" style={{ backgroundColor: '#0f172a' }}>
      <div className="container-fluid px-4 px-xl-5 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center">
            <div className="p-2 rounded-circle me-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Dna size={28} color="#34d399" />
            </div>
            <div>
              <h2 className="fw-bolder mb-0 text-white">Breed<span className="text-success">Genetics</span></h2>
              <p className="text-muted small mb-0 spacing-wide">全自動基因機率演算系統</p>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex bg-dark rounded p-1 border border-secondary border-opacity-25">
              {Object.keys(config.species).map(spKey => (
                <button
                  key={spKey}
                  onClick={() => setSpecies(spKey)}
                  className={cn(
                    "btn btn-sm px-4 py-1 fw-bold border-0 transition-all",
                    species === spKey 
                      ? "btn-success shadow text-white" 
                      : "btn-outline-secondary text-muted border-0 hover-text-white"
                  )}
                >
                  {config.species[spKey].label}
                </button>
              ))}
            </div>
            <button 
              onClick={openSettings}
              className="btn btn-dark border border-secondary border-opacity-50 text-muted hover-text-white d-flex align-items-center"
              title="自訂基因庫"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {children}

      </div>
    </div>
  );
}
