import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Loader2, X, Plus, Save, Trash2 } from 'lucide-react';

export default function SettingsModal({ showSettings, setShowSettings, config, setConfig, species, setActiveGenes }) {
  const [editingConfig, setEditingConfig] = useState(null);
  const [newGene, setNewGene] = useState({ key: '', label: '', category: 'dominant', label1: '', label2: '', label3: '', description: '', speciesKey: '' });
  const [settingsError, setSettingsError] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    if (showSettings && config) {
      setEditingConfig(JSON.parse(JSON.stringify(config)));
      setNewGene({ key: '', label: '', category: 'dominant', label1: '', label2: '', label3: '', description: '', speciesKey: species });
      setSettingsError('');
    }
  }, [showSettings, config, species]);

  if (!showSettings || !editingConfig) return null;

  const handleAddNewGene = () => {
    if (!newGene.key || !newGene.label) {
      setSettingsError('變數 ID 與顯示名稱為必填');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(newGene.key)) {
      setSettingsError('變數 ID 只能包含英數字與底線');
      return;
    }

    const geneObj = {
      label: newGene.label,
      description: newGene.description || '',
      category: newGene.category,
      inputType: 'genotype',
      labels: {}
    };

    if (newGene.category === 'dominant') {
      geneObj.labels.expressed = newGene.label1 || '表現';
      geneObj.labels.not_expressed = newGene.label3 || '未表現';
    } else if (newGene.category === 'recessive') {
      geneObj.labels.not_expressed = newGene.label1 || '未表現';
      geneObj.labels.carrier = newGene.label2 || '帶因';
      geneObj.labels.expressed = newGene.label3 || '表現';
    } else if (newGene.category === 'compound') {
      geneObj.labels.major = newGene.label1 || '同型顯性';
      geneObj.labels.middle = newGene.label2 || '異型';
      geneObj.labels.minor = newGene.label3 || '同型隱性';
    }

    const targetSpecies = newGene.speciesKey || species;

    setEditingConfig(prev => {
      const updated = { ...prev };
      if (!updated.species[targetSpecies].genes) {
        updated.species[targetSpecies].genes = {};
      }
      updated.species[targetSpecies].genes[newGene.key] = geneObj;
      return updated;
    });

    setNewGene({ key: '', label: '', category: 'dominant', label1: '', label2: '', label3: '', description: '', speciesKey: species });
    setSettingsError('');
  };

  const handleRemoveEditingGene = (geneKey) => {
    setEditingConfig(prev => {
      const updated = { ...prev };
      delete updated.species[species].genes[geneKey];
      return updated;
    });
  };

  const saveSettings = async () => {
    setIsSavingConfig(true);
    setSettingsError('');
    try {
      await axios.post('/api/config/save', editingConfig);
      setConfig(editingConfig);
      setShowSettings(false);
      
      const currentGenes = Object.keys(editingConfig.species[species].genes);
      setActiveGenes(prev => ({
        parent1: prev.parent1.filter(k => currentGenes.includes(k)),
        parent2: prev.parent2.filter(k => currentGenes.includes(k))
      }));
    } catch (err) {
      setSettingsError('儲存失敗，請檢查後端連線。');
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 z-3 d-flex align-items-center justify-content-center" style={{backdropFilter: 'blur(4px)', zIndex: 1050}}>
      <div className="card bg-dark border-secondary border-opacity-50 shadow-lg text-light" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh' }}>
        <div className="card-header border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center pt-3 pb-2">
          <h5 className="mb-0 fw-bold d-flex align-items-center">
            <Settings className="me-2 text-primary" size={20} />
            自訂基因庫 - {editingConfig.species[species].label}
          </h5>
          <button 
            onClick={() => setShowSettings(false)}
            className="btn btn-sm btn-outline-secondary border-0 text-muted hover-text-white"
          >
            <X size={20} />
          </button>
        </div>
        <div className="card-body p-4 overflow-auto" style={{ height: '60vh' }}>
          
          <div className="mb-5">
            <h6 className="fw-bold text-success mb-3 d-flex align-items-center"><Plus size={18} className="me-2"/> 新增自訂基因</h6>
            <div className="bg-dark bg-opacity-50 p-3 border border-secondary border-opacity-25 rounded-3">
              <div className="row g-2 mb-2">
                <div className="col-md-3">
                  <label className="small text-muted mb-1">目標物種</label>
                  <select className="form-select form-select-sm dark-select border-secondary border-opacity-25" value={newGene.speciesKey || species} onChange={e => setNewGene({...newGene, speciesKey: e.target.value})}>
                    {Object.keys(editingConfig.species).map(sp => <option key={sp} value={sp}>{editingConfig.species[sp].label}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="small text-muted mb-1">變數 ID (英文)</label>
                  <input type="text" className="form-control form-control-sm bg-transparent text-light border-secondary border-opacity-25" placeholder="e.g. custom_color" value={newGene.key} onChange={e => setNewGene({...newGene, key: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="small text-muted mb-1">顯示名稱</label>
                  <input type="text" className="form-control form-control-sm bg-transparent text-light border-secondary border-opacity-25" placeholder="e.g. 幻彩基因" value={newGene.label} onChange={e => setNewGene({...newGene, label: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="small text-muted mb-1">遺傳類型</label>
                  <select className="form-select form-select-sm dark-select border-secondary border-opacity-25" value={newGene.category} onChange={e => setNewGene({...newGene, category: e.target.value})}>
                    <option value="dominant">完全顯性 (Dominant)</option>
                    <option value="recessive">完全隱性 (Recessive)</option>
                    <option value="compound">不完全顯性 (Compound)</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-2">
                <label className="small text-muted mb-1">基因描述/說明 (選填)</label>
                <input type="text" className="form-control form-control-sm bg-transparent text-light border-secondary border-opacity-25" placeholder="為此基因輸入簡短提示..." value={newGene.description} onChange={e => setNewGene({...newGene, description: e.target.value})} />
              </div>
              
              <div className="row g-2 mb-3">
                <div className="col-md-4">
                  <label className="small text-muted mb-1">AA 同型顯性 表現名稱</label>
                  <input type="text" className="form-control form-control-sm bg-transparent text-light border-secondary border-opacity-25" placeholder={newGene.category === 'recessive' ? '未表現' : '表現'} value={newGene.label1} onChange={e => setNewGene({...newGene, label1: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="small text-muted mb-1">Aa 異型 表現名稱</label>
                  <input type="text" className="form-control form-control-sm bg-transparent text-light border-secondary border-opacity-25" placeholder={newGene.category === 'compound' ? '中間表現' : (newGene.category === 'recessive' ? '帶因' : '表現')} disabled={newGene.category === 'dominant'} value={newGene.category === 'dominant' ? newGene.label1 : newGene.label2} onChange={e => setNewGene({...newGene, label2: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="small text-muted mb-1">aa 同型隱性 表現名稱</label>
                  <input type="text" className="form-control form-control-sm bg-transparent text-light border-secondary border-opacity-25" placeholder={newGene.category === 'recessive' ? '表現' : '未表現'} value={newGene.label3} onChange={e => setNewGene({...newGene, label3: e.target.value})} />
                </div>
              </div>
              <button onClick={handleAddNewGene} className="btn btn-sm btn-outline-success w-100">新增此基因</button>
            </div>
          </div>

          <div>
            <h6 className="fw-bold text-muted mb-3 d-flex align-items-center border-bottom border-secondary border-opacity-25 pb-2">現有基因清單 ({Object.keys(editingConfig.species[species].genes).length})</h6>
            <div className="d-flex flex-column gap-2">
              {Object.entries(editingConfig.species[species].genes).map(([geneKey, geneDef]) => (
                <div key={geneKey} className="d-flex justify-content-between align-items-center bg-dark bg-opacity-25 p-2 px-3 border border-secondary border-opacity-10 rounded">
                  <div>
                    <span className="fw-bold text-light me-2">{geneDef.label}</span>
                    <span className="text-muted small">({geneKey})</span>
                    <span className="badge bg-secondary bg-opacity-25 text-light fw-normal ms-2" style={{fontSize: '0.65rem'}}>{geneDef.category}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveEditingGene(geneKey)}
                    className="btn btn-sm text-danger hover-bg-danger hover-bg-opacity-10 p-1 rounded transition-all"
                    title="移除此基因"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {Object.keys(editingConfig.species[species].genes).length === 0 && (
                <div className="text-center text-muted small py-3">目前沒有任何自訂基因</div>
              )}
            </div>
          </div>

        </div>
        <div className="card-footer border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-3">
          <div className="text-danger small fw-bold">
            {settingsError}
          </div>
          <div>
            <button onClick={() => setShowSettings(false)} className="btn btn-outline-secondary me-2">取消</button>
            <button 
              onClick={saveSettings} 
              disabled={isSavingConfig}
              className="btn btn-primary d-flex align-items-center"
            >
              {isSavingConfig ? <Loader2 className="animate-spin me-2" size={18} /> : <Save className="me-2" size={18} />}
              儲存並套用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
