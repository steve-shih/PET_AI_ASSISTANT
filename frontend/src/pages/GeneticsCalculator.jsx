import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Loader2, RefreshCcw, X, Plus, PieChart as PieChartIcon, Trash2, HelpCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { cn, getDefaultAllele, getOptionsForGene } from '../utils/genetics';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e', '#6366f1', '#eab308', '#64748b'];

export default function GeneticsCalculator({ config, species, activeGenes, setActiveGenes }) {
  const [geneInputs, setGeneInputs] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!config || !config.species[species]) return;
    const genes = config.species[species].genes;
    const initialInputs = {};
    Object.keys(genes).forEach((geneKey) => {
      const defaultVal = getDefaultAllele(genes[geneKey], config);
      initialInputs[geneKey] = {
        parent1: defaultVal,
        parent2: defaultVal
      };
    });
    setGeneInputs(initialInputs);
    // Since we lift activeGenes state to Layout/App to persist across routing,
    // we should only reset results and errors on species change.
    setResults(null); 
    setError('');
  }, [species, config]);

  const handleGeneChange = (geneKey, parentKey, val) => {
    setGeneInputs(prev => ({
      ...prev,
      [geneKey]: {
        ...prev[geneKey],
        [parentKey]: val
      }
    }));
  };

  const handleAddGene = (parentKey, geneKey) => {
    if (!geneKey) return;
    if (!activeGenes[parentKey].includes(geneKey)) {
      setActiveGenes(prev => ({
        ...prev,
        [parentKey]: [...prev[parentKey], geneKey]
      }));
    }
  };

  const handleRemoveGene = (parentKey, geneKey) => {
    setActiveGenes(prev => ({
      ...prev,
      [parentKey]: prev[parentKey].filter(k => k !== geneKey)
    }));
  };

  const calculateGenetics = async () => {
    setIsCalculating(true);
    setError('');
    setResults(null);
    try {
      const requestedGenes = Array.from(new Set([...activeGenes.parent1, ...activeGenes.parent2]));
      
      if (requestedGenes.length === 0) {
        setError('請至少選擇一種基因參與運算');
        setIsCalculating(false);
        return;
      }

      const payloadGenes = {};
      const genesConfig = config.species[species].genes;

      requestedGenes.forEach(geneKey => {
        const geneDef = genesConfig[geneKey];
        const p1Val = activeGenes.parent1.includes(geneKey) 
          ? geneInputs[geneKey].parent1 
          : getDefaultAllele(geneDef, config);
        const p2Val = activeGenes.parent2.includes(geneKey) 
          ? geneInputs[geneKey].parent2 
          : getDefaultAllele(geneDef, config);
        
        payloadGenes[geneKey] = { parent1: p1Val, parent2: p2Val };
      });

      const res = await axios.post('/api/calculate', {
        species,
        genes: payloadGenes
      });
      setResults(res.data);
    } catch (err) {
      setError('計算失敗，請檢查輸入或後端狀態');
    } finally {
      setIsCalculating(false);
    }
  };

  if (!config) {
    return (
      <div className="min-vh-50 d-flex align-items-center justify-content-center text-success">
        <Loader2 className="me-3 animate-spin" />
        <span className="fs-5 tracking-wider">載入基因圖譜中...</span>
      </div>
    );
  }

  const currentSpeciesConfig = config.species[species] || { genes: {} };

  return (
    <>
      {error && (
        <div className="alert alert-danger d-flex align-items-center bg-danger bg-opacity-10 border-danger text-danger border-opacity-25 py-2 mb-4" role="alert">
          <Activity className="me-3" size={20} />
          <div>{error}</div>
        </div>
      )}

      <div className="row g-4">
        {/* 左側：父母設定區 */}
        <div className="col-lg-8">
          <div className="row g-3 mb-4">
            {/* 公貓區 Parent 1 */}
            <div className="col-md-6">
              <div className="card h-100 border-0 glass-card">
                <div className="card-header border-bottom border-secondary border-opacity-25 bg-transparent pt-3 pb-2">
                  <h5 className="fw-bold text-center text-white mb-0 d-flex justify-content-center align-items-center">
                    <span style={{color: '#3b82f6', fontSize: '1.2rem'}} className="me-2">♂</span> 雄性前代 (Sire)
                  </h5>
                </div>
                <div className="card-body p-3 d-flex flex-column">
                  <div className="mb-3">
                    <select 
                      className="form-select dark-select border-secondary border-opacity-25"
                      onChange={(e) => { handleAddGene('parent1', e.target.value); e.target.value = ''; }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ 新增雄性持有特徵...</option>
                      {Object.keys(currentSpeciesConfig.genes)
                        .filter(k => !activeGenes.parent1.includes(k))
                        .map(k => (
                          <option key={k} value={k}>{currentSpeciesConfig.genes[k].label}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="flex-grow-1" style={{maxHeight: '55vh', overflowY: 'auto'}}>
                    {activeGenes.parent1.length === 0 && (
                      <div className="text-center text-muted p-4 py-5 border border-secondary border-opacity-25 rounded-4 border-dashed h-100 d-flex flex-column align-items-center justify-content-center">
                        <Plus size={24} className="mb-2 opacity-50"/>
                        <small>從上方選單加入特徵基因</small>
                      </div>
                    )}
                    
                    {activeGenes.parent1.map((geneKey) => {
                      const geneDef = currentSpeciesConfig.genes[geneKey];
                      const options = getOptionsForGene(geneDef, config);
                      return (
                        <div key={`p1-${geneKey}`} className="mb-3 bg-dark bg-opacity-25 p-3 rounded-4 border border-secondary border-opacity-10 position-relative">
                          <button 
                            onClick={() => handleRemoveGene('parent1', geneKey)}
                            className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 py-0 px-2 mt-2 me-2 d-flex align-items-center"
                            style={{fontSize: '0.7rem', height: '20px'}}
                            title="移除此預備特徵"
                          >
                            <Trash2 size={12} className="me-1" /> 移除
                          </button>
                          <label className="form-label text-light small fw-bold mb-2 d-flex align-items-center">
                            {geneDef.label}
                            {geneDef.description && (
                              <HelpCircle size={14} className="ms-2 text-muted" title={geneDef.description} style={{cursor: 'help'}} />
                            )}
                            <span className="badge bg-secondary bg-opacity-25 text-light fw-normal ms-2" style={{fontSize: '0.65rem'}}>{geneDef.category}</span>
                          </label>
                          <div className="d-flex flex-wrap gap-2">
                            {options.map(opt => {
                              const isSelected = geneInputs[geneKey]?.parent1 === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => handleGeneChange(geneKey, 'parent1', opt.value)}
                                  className={cn(
                                    "btn btn-sm rounded-pill transition-all",
                                    isSelected 
                                      ? "btn-primary px-3 fw-bold text-white shadow-sm border-0 bg-opacity-75"
                                      : "btn-outline-secondary text-muted px-3 border-secondary border-opacity-25 hover-text-white"
                                  )}
                                  style={isSelected ? {backgroundColor: '#3b82f6'} : {}}
                                >
                                  {opt.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 母貓區 Parent 2 */}
            <div className="col-md-6">
              <div className="card h-100 border-0 glass-card">
                <div className="card-header border-bottom border-secondary border-opacity-25 bg-transparent pt-3 pb-2">
                  <h5 className="fw-bold text-center text-white mb-0 d-flex justify-content-center align-items-center">
                    <span style={{color: '#ec4899', fontSize: '1.2rem'}} className="me-2">♀</span> 雌性前代 (Dam)
                  </h5>
                </div>
                <div className="card-body p-3 d-flex flex-column">
                  <div className="mb-3">
                    <select 
                      className="form-select dark-select border-secondary border-opacity-25"
                      onChange={(e) => { handleAddGene('parent2', e.target.value); e.target.value = ''; }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ 新增雌性持有特徵...</option>
                      {Object.keys(currentSpeciesConfig.genes)
                        .filter(k => !activeGenes.parent2.includes(k))
                        .map(k => (
                          <option key={k} value={k}>{currentSpeciesConfig.genes[k].label}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="flex-grow-1" style={{maxHeight: '55vh', overflowY: 'auto'}}>
                    {activeGenes.parent2.length === 0 && (
                      <div className="text-center text-muted p-4 py-5 border border-secondary border-opacity-25 rounded-4 border-dashed h-100 d-flex flex-column align-items-center justify-content-center">
                        <Plus size={24} className="mb-2 opacity-50"/>
                        <small>從上方選單加入特徵基因</small>
                      </div>
                    )}

                    {activeGenes.parent2.map((geneKey) => {
                      const geneDef = currentSpeciesConfig.genes[geneKey];
                      const options = getOptionsForGene(geneDef, config);
                      return (
                        <div key={`p2-${geneKey}`} className="mb-3 bg-dark bg-opacity-25 p-3 rounded-4 border border-secondary border-opacity-10 position-relative">
                          <button 
                            onClick={() => handleRemoveGene('parent2', geneKey)}
                            className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 py-0 px-2 mt-2 me-2 d-flex align-items-center"
                            style={{fontSize: '0.7rem', height: '20px'}}
                            title="移除此預備特徵"
                          >
                            <Trash2 size={12} className="me-1" /> 移除
                          </button>
                          <label className="form-label text-light small fw-bold mb-2 d-flex align-items-center">
                            {geneDef.label}
                            {geneDef.description && (
                              <HelpCircle size={14} className="ms-2 text-muted" title={geneDef.description} style={{cursor: 'help'}} />
                            )}
                            <span className="badge bg-secondary bg-opacity-25 text-light fw-normal ms-2" style={{fontSize: '0.65rem'}}>{geneDef.category}</span>
                          </label>
                          <div className="d-flex flex-wrap gap-2">
                            {options.map(opt => {
                              const isSelected = geneInputs[geneKey]?.parent2 === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => handleGeneChange(geneKey, 'parent2', opt.value)}
                                  className={cn(
                                    "btn btn-sm rounded-pill transition-all",
                                    isSelected 
                                      ? "btn-primary px-3 fw-bold text-white shadow-sm border-0 bg-opacity-75"
                                      : "btn-outline-secondary text-muted px-3 border-secondary border-opacity-25 hover-text-white"
                                  )}
                                  style={isSelected ? {backgroundColor: '#ec4899'} : {}}
                                >
                                  {opt.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={calculateGenetics}
            disabled={isCalculating || (activeGenes.parent1.length === 0 && activeGenes.parent2.length === 0)}
            className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-lg d-flex align-items-center justify-content-center border-0"
            style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', opacity: (activeGenes.parent1.length === 0 && activeGenes.parent2.length === 0) ? 0.5 : 1 }}
          >
            {isCalculating ? (
              <><Loader2 className="me-2 animate-spin" /> 基因矩陣運算中...</>
            ) : (
              <><RefreshCcw className="me-2" /> 執行多基因重組分析</>
            )}
          </button>
        </div>

        {/* 右側：計算結果面板 */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '1.5rem' }}>
            <div className="d-flex align-items-center mb-3">
              <PieChartIcon className="text-success me-2" size={20} />
              <h5 className="fw-bold text-white mb-0">基因分佈與排行榜</h5>
            </div>

            {!results ? (
              <div className="card border-0 glass-card text-center p-5">
                <div className="card-body d-flex flex-column align-items-center justify-content-center py-5">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                    <Activity size={32} className="text-secondary opacity-50" />
                  </div>
                  <p className="text-muted fw-semibold mb-0">設定父母基因後<br/>點擊執行進行分析</p>
                </div>
              </div>
            ) : (
              <div className="card border-0 glass-card shadow-lg" style={{maxHeight: '75vh', overflowY: 'auto'}}>
                <div className="card-body p-3 p-xl-4 d-flex flex-column">

                  {results.combinations && results.combinations.length > 0 ? (
                    <>
                      <div className="mb-4 d-flex justify-content-center align-items-center position-relative" style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={results.combinations.slice(0, 8).map(c => ({ name: c.labels.join(', '), value: Number((c.probability * 100).toFixed(1)) }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={85}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {results.combinations.slice(0, 8).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                              formatter={(value) => `${value}%`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="position-absolute d-flex flex-column align-items-center justify-content-center pointer-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                          <span className="text-white fw-bold fs-4">{results.combinations.length}</span>
                          <span className="text-muted" style={{fontSize: '0.7rem'}}>種組合</span>
                        </div>
                      </div>

                      <h6 className="text-muted fw-bold text-uppercase tracking-wider mb-3 border-bottom border-secondary border-opacity-25 pb-2 mt-2" style={{fontSize: '0.75rem'}}>
                        機率分佈 (Top 10)
                      </h6>

                      <div className="d-flex flex-column gap-2">
                        {results.combinations.slice(0, 10).map((combo, i) => (
                          <div key={i} className="bg-dark bg-opacity-50 rounded-4 p-3 border border-secondary border-opacity-10 hover-effect">
                            <div className="d-flex align-items-end justify-content-between mb-2">
                              <span className="fs-5 fw-bolder text-white lh-1">
                                {Number(combo.probability * 100).toFixed(1)}<span className="fs-6 text-muted ms-1">%</span>
                              </span>
                            </div>
                            
                            <div className="progress mb-2 bg-secondary bg-opacity-25" style={{ height: '4px', borderRadius: '4px' }}>
                              <div 
                                className="progress-bar" 
                                role="progressbar" 
                                style={{ width: `${combo.probability * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
                                aria-valuenow={combo.probability * 100}
                                aria-valuemin="0" 
                                aria-valuemax="100">
                              </div>
                            </div>
                            
                            <div className="d-flex flex-wrap gap-1 mt-2">
                              {combo.labels.map((lbl, idx) => (
                                <span key={idx} className="badge bg-secondary bg-opacity-25 text-light fw-normal rounded-pill px-2 py-1" style={{fontSize: '0.65rem'}}>
                                  {lbl}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-muted text-center py-4">無有效組合</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
