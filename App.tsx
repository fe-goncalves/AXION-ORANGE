import React, { useState, useEffect } from 'react';
import { ICONS, INITIAL_TEAMS, INITIAL_STAFF, INITIAL_COMPETITIONS, INITIAL_SEASONS, INITIAL_WEEKS } from './constants';
import { AppState, Transaction, Team, StaffMember, Competition, Season, Week } from './types';
import * as Storage from './services/storage';
import TransactionModal from './components/TransactionModal';
import ConfirmModal from './components/ConfirmModal';

// Components
import Dashboard from './components/Dashboard';
import TeamsView from './components/TeamsView';
import StaffView from './components/StaffView';
import LocationView from './components/LocationView';
import CostsView from './components/CostsView';
import LedgerView from './components/LedgerView';
import CompetitionsView from './components/CompetitionsView';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: ICONS.Dashboard },
  { id: 'competitions', label: 'Competições', icon: ICONS.Trophy },
  { id: 'teams', label: 'Equipes', icon: ICONS.Teams },
  { id: 'staff', label: 'Staff', icon: ICONS.Staff },
  { id: 'location', label: 'Local', icon: ICONS.Location },
  { id: 'costs', label: 'Custos', icon: ICONS.Costs },
  { id: 'ledger', label: 'Extrato', icon: ICONS.Ledger },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({
    isOpen: false,
    message: '',
    onConfirm: () => {}
  });
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [prefillEntity, setPrefillEntity] = useState<{type: string, id: string, name: string, category?: string} | undefined>(undefined);

  const [state, setState] = useState<AppState>({
    transactions: [],
    teams: INITIAL_TEAMS as Team[],
    staff: INITIAL_STAFF as StaffMember[],
    competitions: INITIAL_COMPETITIONS as Competition[],
    seasons: INITIAL_SEASONS as Season[],
    weeks: INITIAL_WEEKS as Week[]
  });

  useEffect(() => {
    const loaded = Storage.loadState();
    if (loaded) {
      const migratedTransactions = loaded.transactions.map((t: any) => ({
        ...t,
        round: t.round || t.contextValue || '', 
        status: t.status === 'PARTIAL' ? 'PARTIAL' : t.status,
      }));
      
      setState({
        ...loaded,
        transactions: migratedTransactions as Transaction[],
        competitions: loaded.competitions || INITIAL_COMPETITIONS,
        seasons: loaded.seasons || INITIAL_SEASONS,
        weeks: loaded.weeks || INITIAL_WEEKS
      });
    }
  }, []);

  useEffect(() => {
    Storage.saveState(state);
  }, [state]);

  // Helper to open confirm modal
  const requestConfirm = (message: string, action: () => void) => {
    setConfirmConfig({
        isOpen: true,
        message,
        onConfirm: action
    });
  };

  const handleSaveTransaction = (tData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === editingTransaction.id ? { ...tData, id: t.id, createdAt: t.createdAt } : t)
      }));
    } else {
      const newTransaction: Transaction = {
        ...tData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setState(prev => ({
        ...prev,
        transactions: [...prev.transactions, newTransaction]
      }));
    }
    setEditingTransaction(null);
    setPrefillEntity(undefined);
  };

  const deleteTransaction = (id: string) => {
    requestConfirm('Tem certeza que deseja excluir?', () => {
        setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    });
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const openNewModal = (prefill?: typeof prefillEntity) => {
    setEditingTransaction(null);
    setPrefillEntity(prefill);
    setIsModalOpen(true);
  };

  // State Updaters with Confirmation
  const updateTeam = (t: Team) => {
    setState(prev => {
      const newTeams = prev.teams.map(x => x.id === t.id ? t : x);
      const newTrans = prev.transactions.map(tr => 
        (tr.entityType === 'TEAM' && tr.entityId === t.id) ? { ...tr, entityName: t.name } : tr
      );
      return { ...prev, teams: newTeams, transactions: newTrans };
    });
  };
  const addTeam = (t: Team) => setState(p => ({ ...p, teams: [...p.teams, t] }));
  const deleteTeam = (id: string) => {
    requestConfirm('Tem certeza que deseja excluir?', () => {
        setState(p => ({ ...p, teams: p.teams.filter(x => x.id !== id) }));
    });
  };
  
  const updateStaff = (s: StaffMember) => {
    setState(prev => {
      const newStaff = prev.staff.map(x => x.id === s.id ? s : x);
      const newTrans = prev.transactions.map(tr => 
        (tr.entityType === 'STAFF' && tr.entityId === s.id) ? { ...tr, entityName: s.name } : tr
      );
      return { ...prev, staff: newStaff, transactions: newTrans };
    });
  };
  const addStaff = (s: StaffMember) => setState(p => ({ ...p, staff: [...p.staff, s] }));
  const deleteStaff = (id: string) => {
    requestConfirm('Tem certeza que deseja excluir?', () => {
        setState(p => ({ ...p, staff: p.staff.filter(x => x.id !== id) }));
    });
  };

  // Competition / Season / Week Updaters
  const addComp = (c: Competition) => setState(p => ({ ...p, competitions: [...p.competitions, c] }));
  const updateComp = (c: Competition) => setState(p => ({ ...p, competitions: p.competitions.map(x => x.id === c.id ? c : x) }));
  const deleteComp = (id: string) => {
    requestConfirm('Tem certeza que deseja excluir?', () => {
        setState(p => ({ ...p, competitions: p.competitions.filter(x => x.id !== id) }));
    });
  };

  const addSeason = (s: Season) => setState(p => ({ ...p, seasons: [...p.seasons, s] }));
  const updateSeason = (s: Season) => setState(p => ({ ...p, seasons: p.seasons.map(x => x.id === s.id ? s : x) }));
  const deleteSeason = (id: string) => {
    requestConfirm('Tem certeza que deseja excluir?', () => {
        setState(p => ({ ...p, seasons: p.seasons.filter(x => x.id !== id) }));
    });
  };

  const addWeek = (w: Week) => setState(p => ({ ...p, weeks: [...p.weeks, w] }));
  const updateWeek = (w: Week) => setState(p => ({ ...p, weeks: p.weeks.map(x => x.id === w.id ? w : x) }));
  const deleteWeek = (id: string) => {
    requestConfirm('Tem certeza que deseja excluir?', () => {
        setState(p => ({ ...p, weeks: p.weeks.filter(x => x.id !== id) }));
    });
  };


  const renderContent = () => {
    const commonProps = {
      transactions: state.transactions,
      onEditTransaction: openEditModal, 
      onDeleteTransaction: deleteTransaction
    };

    return (
      <div key={activeTab} className="w-full">
        {activeTab === 'dashboard' && <Dashboard 
            transactions={state.transactions} 
            onNewClick={() => openNewModal()} 
            teams={state.teams}
            staff={state.staff}
        />}
        {activeTab === 'competitions' && (
            <CompetitionsView 
                competitions={state.competitions} 
                seasons={state.seasons}
                weeks={state.weeks}
                onAddComp={addComp} 
                onUpdateComp={updateComp} 
                onDeleteComp={deleteComp}
                onAddSeason={addSeason}
                onUpdateSeason={updateSeason}
                onDeleteSeason={deleteSeason}
                onAddWeek={addWeek}
                onUpdateWeek={updateWeek}
                onDeleteWeek={deleteWeek}
            />
        )}
        {activeTab === 'teams' && <TeamsView {...commonProps} teams={state.teams} onAddTeam={addTeam} onUpdateTeam={updateTeam} onDeleteTeam={deleteTeam} onOpenTransaction={(id, name) => openNewModal({ type: 'TEAM', id, name })} />}
        {activeTab === 'staff' && <StaffView {...commonProps} staff={state.staff} onAddStaff={addStaff} onUpdateStaff={updateStaff} onDeleteStaff={deleteStaff} onOpenTransaction={(id, name) => openNewModal({ type: 'STAFF', id, name })} />}
        {activeTab === 'location' && <LocationView {...commonProps} onNewEntry={() => openNewModal({ type: 'COST', id: 'GENERIC', name: 'Aluguel Quadra', category: 'Aluguel Quadra' })} />}
        
        {activeTab === 'costs' && <CostsView {...commonProps} onNewEntry={() => openNewModal({ type: 'EXPENSE', id: 'GENERIC', name: '', category: 'Outros' })} />}
        
        {activeTab === 'ledger' && <LedgerView 
            transactions={state.transactions} 
            competitions={state.competitions} 
            teams={state.teams} 
            seasons={state.seasons}
            weeks={state.weeks}
            onDelete={deleteTransaction} 
            onEdit={openEditModal} 
        />}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#000000] text-white">
      {/* Mobile Header */}
      <div className="md:hidden glass-panel p-4 flex justify-between items-center sticky top-0 z-40 border-b border-white/5">
        <h1 className="text-sm font-semibold tracking-widest text-[#28F587] uppercase">Orange League</h1>
        <button className="text-white" onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}>
           <ICONS.Dashboard size={24} />
        </button>
      </div>

      {/* Static Sidebar - Toxic Glass Style */}
      <nav id="mobile-menu" className="hidden md:flex flex-col w-full md:w-64 flex-shrink-0 h-screen sticky top-0 border-r border-white/5 z-50 bg-black/40 backdrop-blur-xl">
        <div className="p-10 pb-12">
           <div className="flex items-center gap-3">
             <div className="w-6 h-6 rounded-sm bg-[#28F587] flex items-center justify-center text-black font-bold text-xs">O</div>
             <div>
                <h1 className="text-sm font-semibold text-white tracking-[0.2em] leading-none uppercase">Orange</h1>
             </div>
           </div>
        </div>

        <div className="flex-1 px-0 space-y-1 overflow-y-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center w-full px-8 py-4 transition-all duration-300 relative group ${
                activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {activeTab === tab.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-[#28F587] shadow-[0_0_10px_#28F587]"></div>
              )}
              <tab.icon size={18} weight="light" className={`mr-4 transition-colors ${activeTab === tab.id ? 'text-[#28F587]' : 'text-gray-600 group-hover:text-white'}`} />
              <span className={`menu-text ${activeTab === tab.id ? 'text-[#28F587]' : ''}`}>{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="p-8 mt-auto space-y-2">
           <button onClick={() => Storage.exportData(state)} className="w-full text-[10px] uppercase tracking-widest text-gray-600 hover:text-white flex items-center gap-3 py-2 transition-colors">
             <ICONS.Download size={14} /> Backup
           </button>
           <label className="w-full text-[10px] uppercase tracking-widest text-gray-600 hover:text-white flex items-center gap-3 py-2 transition-colors cursor-pointer">
             <ICONS.Upload size={14} /> Restore
             <input type="file" accept=".json" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const parsed = JSON.parse(ev.target?.result as string);
                    if (parsed.transactions) {
                      setState({...parsed, competitions: parsed.competitions || INITIAL_COMPETITIONS});
                      alert('Database restored successfully.');
                    }
                  } catch (err) { alert('Invalid file format.'); }
                };
                reader.readAsText(file);
             }} />
           </label>
        </div>
      </nav>

      <main className="flex-1 min-w-0 bg-[#000000]">
        <div className="max-w-[1400px] mx-auto p-6 md:p-12 pb-24">
           {renderContent()}
        </div>
      </main>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); setPrefillEntity(undefined); }} 
        onSave={handleSaveTransaction}
        teams={state.teams}
        staff={state.staff}
        competitions={state.competitions}
        seasons={state.seasons}
        weeks={state.weeks}
        initialData={editingTransaction}
        prefillEntity={prefillEntity}
      />
      
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({...prev, isOpen: false}))}
      />
    </div>
  );
}

export default App;