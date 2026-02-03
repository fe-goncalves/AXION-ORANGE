import React, { useState } from 'react';
import { Competition, Season, Week } from '../types';
import { ICONS } from '../constants';
import { resizeImage } from '../utils';

interface CompetitionsViewProps {
  competitions: Competition[];
  seasons: Season[];
  weeks: Week[];
  onAddComp: (c: Competition) => void;
  onUpdateComp: (c: Competition) => void;
  onDeleteComp: (id: string) => void;
  onAddSeason: (s: Season) => void;
  onUpdateSeason: (s: Season) => void;
  onDeleteSeason: (id: string) => void;
  onAddWeek: (w: Week) => void;
  onUpdateWeek: (w: Week) => void;
  onDeleteWeek: (id: string) => void;
}

type SubTab = 'LEAGUES' | 'SEASONS' | 'WEEKS';

const CompetitionsView: React.FC<CompetitionsViewProps> = ({ 
    competitions, seasons, weeks, 
    onAddComp, onUpdateComp, onDeleteComp,
    onAddSeason, onUpdateSeason, onDeleteSeason,
    onAddWeek, onUpdateWeek, onDeleteWeek
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('LEAGUES');
  
  // -- League State --
  const [isEditingComp, setIsEditingComp] = useState(false);
  const [editCompId, setEditCompId] = useState<string | null>(null);
  const [compName, setCompName] = useState('');
  const [compSeasonId, setCompSeasonId] = useState('');
  const [compRoundsStr, setCompRoundsStr] = useState('');
  const [compLogo, setCompLogo] = useState('');

  // -- Season State --
  const [isEditingSeason, setIsEditingSeason] = useState(false);
  const [editSeasonId, setEditSeasonId] = useState<string | null>(null);
  const [seasonName, setSeasonName] = useState('');

  // -- Week State --
  const [isEditingWeek, setIsEditingWeek] = useState(false);
  const [editWeekId, setEditWeekId] = useState<string | null>(null);
  const [weekName, setWeekName] = useState('');

  // --- Handlers: Leagues ---
  const handleCompImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setCompLogo(await resizeImage(e.target.files[0]));
  };
  const startEditComp = (c: Competition) => {
    setEditCompId(c.id); setCompName(c.name); setCompSeasonId(c.seasonId || ''); setCompRoundsStr(c.rounds.join('\n')); setCompLogo(c.logo || ''); setIsEditingComp(true);
  };
  const saveComp = (e: React.FormEvent) => {
    e.preventDefault();
    const roundsArray = compRoundsStr.split('\n').map(r => r.trim()).filter(r => r !== '');
    if (editCompId) onUpdateComp({ id: editCompId, name: compName, seasonId: compSeasonId, rounds: roundsArray, logo: compLogo });
    else onAddComp({ id: crypto.randomUUID(), name: compName, seasonId: compSeasonId, rounds: roundsArray, logo: compLogo });
    resetComp();
  };
  const resetComp = () => { setIsEditingComp(false); setEditCompId(null); setCompName(''); setCompSeasonId(''); setCompRoundsStr(''); setCompLogo(''); };

  // --- Handlers: Seasons ---
  const startEditSeason = (s: Season) => { setEditSeasonId(s.id); setSeasonName(s.name); setIsEditingSeason(true); };
  const saveSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (editSeasonId) onUpdateSeason({ id: editSeasonId, name: seasonName });
    else onAddSeason({ id: crypto.randomUUID(), name: seasonName });
    resetSeason();
  };
  const resetSeason = () => { setIsEditingSeason(false); setEditSeasonId(null); setSeasonName(''); };

  // --- Handlers: Weeks ---
  const startEditWeek = (w: Week) => { setEditWeekId(w.id); setWeekName(w.name); setIsEditingWeek(true); };
  const saveWeek = (e: React.FormEvent) => {
    e.preventDefault();
    if (editWeekId) onUpdateWeek({ id: editWeekId, name: weekName });
    else onAddWeek({ id: crypto.randomUUID(), name: weekName });
    resetWeek();
  };
  const resetWeek = () => { setIsEditingWeek(false); setEditWeekId(null); setWeekName(''); };


  return (
    <div className="space-y-12 animate-stagger">
      
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
           <h2 className="text-2xl font-light text-white tracking-tight mb-1">Competitions Manager</h2>
           <p className="text-gray-500 font-light text-sm">Leagues, Seasons & Weeks</p>
        </div>
        
        <div className="flex bg-white/5 rounded-xl p-1">
            <button onClick={() => setActiveSubTab('LEAGUES')} className={`px-6 py-2 rounded-lg text-xs font-medium transition-colors ${activeSubTab === 'LEAGUES' ? 'bg-[#28F587] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>Leagues</button>
            <button onClick={() => setActiveSubTab('SEASONS')} className={`px-6 py-2 rounded-lg text-xs font-medium transition-colors ${activeSubTab === 'SEASONS' ? 'bg-[#28F587] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>Seasons</button>
            <button onClick={() => setActiveSubTab('WEEKS')} className={`px-6 py-2 rounded-lg text-xs font-medium transition-colors ${activeSubTab === 'WEEKS' ? 'bg-[#28F587] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>#Weeks</button>
        </div>
      </div>

      {/* --- LEAGUES TAB --- */}
      {activeSubTab === 'LEAGUES' && (
        <div className="animate-stagger">
             <div className="flex justify-end mb-4">
                <button onClick={() => { resetComp(); setIsEditingComp(!isEditingComp); }} className="px-6 py-3 rounded-lg flex items-center gap-2 label-text text-xs transition-all border border-white/10 hover:border-[#28F587] hover:text-[#28F587] text-white">
                    {isEditingComp ? 'Close Editor' : 'New League'}
                </button>
             </div>

             {isEditingComp && (
                <form onSubmit={saveComp} className="glass-panel p-8 rounded-2xl space-y-6 mb-8 animate-stagger">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] text-gray-500 label-text mb-2 block">Nome da liga</label>
                            <input required value={compName} onChange={e => setCompName(e.target.value)} className="w-full toxic-input rounded-lg p-3 value-text" placeholder="Ex: Liga Orange" />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 label-text mb-2 block">Temporada</label>
                            <select required value={compSeasonId} onChange={e => setCompSeasonId(e.target.value)} className="w-full toxic-input rounded-lg p-3 value-text bg-transparent appearance-none">
                                <option className="bg-black text-white" value="">Selecione...</option>
                                {seasons.map(s => <option key={s.id} value={s.id} className="bg-black text-white">{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 label-text mb-2 block">Logo</label>
                        <input type="file" accept="image/*" onChange={handleCompImage} className="w-full toxic-input rounded-lg p-3 text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer font-medium" />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 label-text mb-2 block">Rodadas (Uma por linha)</label>
                        <textarea required value={compRoundsStr} onChange={e => setCompRoundsStr(e.target.value)} className="w-full toxic-input rounded-lg p-3 h-32 outline-none value-text" placeholder="Rodada 1&#10;Rodada 2" />
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="bg-[#28F587] text-black label-text py-3 px-8 rounded-lg shadow-lg shadow-[#28F587]/20 transition-transform hover:scale-[1.02] text-xs">{editCompId ? 'Atualizar' : 'Criar'}</button>
                        <button type="button" onClick={resetComp} className="text-gray-400 hover:text-white px-4 label-text text-xs">Cancelar</button>
                    </div>
                </form>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {competitions.map((c, i) => {
                    const season = seasons.find(s => s.id === c.seasonId);
                    return (
                        <div key={c.id} className={`glass-panel rounded-2xl p-8 relative group flex flex-col gap-6 animate-stagger stagger-${(i % 3) + 1}`}>
                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button onClick={() => startEditComp(c)} className="p-2 bg-white/10 rounded-md hover:bg-white text-white hover:text-black transition-colors"><ICONS.Edit size={16} /></button>
                                <button onClick={() => onDeleteComp(c.id)} className="p-2 bg-white/10 rounded-md hover:bg-red-500 text-white transition-colors"><ICONS.Delete size={16} /></button>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-[#28F587] transition-colors">
                                    {c.logo ? <img src={c.logo} className="w-full h-full object-cover" /> : <ICONS.Trophy size={28} weight="thin" className="text-white/20" />}
                                </div>
                                <div>
                                    <h3 className="text-xl value-text text-white tracking-tight leading-snug mb-1">{c.name}</h3>
                                    <span className="bg-[#28F587]/10 text-[#28F587] border border-[#28F587]/20 px-2 py-0.5 rounded text-[10px] label-text">
                                        {season ? season.name : 'Sem temporada'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-white/5">
                                <p className="text-[10px] text-gray-500 label-text mb-3">Active Rounds</p>
                                <div className="flex flex-wrap gap-2">
                                    {c.rounds.slice(0, 5).map(r => (
                                        <span key={r} className="bg-white/5 text-gray-300 text-[10px] label-text px-2 py-1 rounded border border-white/5 group-hover:border-white/10">{r}</span>
                                    ))}
                                    {c.rounds.length > 5 && <span className="text-[10px] text-gray-500 font-medium py-1 px-2">+{c.rounds.length - 5}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>
        </div>
      )}

      {/* --- SEASONS TAB --- */}
      {activeSubTab === 'SEASONS' && (
        <div className="max-w-3xl mx-auto animate-stagger">
             <div className="glass-panel p-8 rounded-2xl mb-8">
                <h3 className="value-text text-lg text-white mb-6">{isEditingSeason ? 'Edit Season' : 'New Season'}</h3>
                <form onSubmit={saveSeason} className="flex gap-4 items-end">
                    <input required value={seasonName} onChange={e => setSeasonName(e.target.value)} className="flex-1 toxic-input p-3 rounded-lg value-text" placeholder="Ex: 2026 I" />
                    <button className="bg-[#28F587] text-black px-8 py-3 rounded-lg label-text shadow-lg shadow-[#28F587]/20 text-xs">{isEditingSeason ? 'Update' : 'Add'}</button>
                    {isEditingSeason && <button type="button" onClick={resetSeason} className="text-gray-400 px-4 text-xs">Cancel</button>}
                </form>
             </div>

             <div className="space-y-4">
                {seasons.map(s => (
                    <div key={s.id} className="glass-panel p-4 rounded-xl flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <ICONS.Season className="text-gray-500" size={24} />
                            <span className="value-text text-white">{s.name}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => startEditSeason(s)} className="text-gray-500 hover:text-white p-2"><ICONS.Edit size={16} /></button>
                             <button onClick={() => onDeleteSeason(s.id)} className="text-red-400 hover:text-red-300 p-2"><ICONS.Delete size={16} /></button>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      )}

      {/* --- WEEKS TAB --- */}
      {activeSubTab === 'WEEKS' && (
        <div className="max-w-3xl mx-auto animate-stagger">
             <div className="glass-panel p-8 rounded-2xl mb-8">
                <h3 className="value-text text-lg text-white mb-6">{isEditingWeek ? 'Edit Week' : 'New Week'}</h3>
                <form onSubmit={saveWeek} className="flex gap-4 items-end">
                    <input required value={weekName} onChange={e => setWeekName(e.target.value)} className="flex-1 toxic-input p-3 rounded-lg value-text" placeholder="Ex: #Week 10" />
                    <button className="bg-[#28F587] text-black px-8 py-3 rounded-lg label-text shadow-lg shadow-[#28F587]/20 text-xs">{isEditingWeek ? 'Update' : 'Add'}</button>
                    {isEditingWeek && <button type="button" onClick={resetWeek} className="text-gray-400 px-4 text-xs">Cancel</button>}
                </form>
             </div>

             <div className="space-y-4">
                {weeks.map(w => (
                    <div key={w.id} className="glass-panel p-4 rounded-xl flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <ICONS.Week className="text-gray-500" size={24} />
                            <span className="value-text text-white">{w.name}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => startEditWeek(w)} className="text-gray-500 hover:text-white p-2"><ICONS.Edit size={16} /></button>
                             <button onClick={() => onDeleteWeek(w.id)} className="text-red-400 hover:text-red-300 p-2"><ICONS.Delete size={16} /></button>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      )}

    </div>
  );
};

export default CompetitionsView;