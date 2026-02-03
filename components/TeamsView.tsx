import React, { useState, useMemo } from 'react';
import { Transaction, Team } from '../types';
import { ICONS } from '../constants';
import { resizeImage, formatCurrency, formatDateDisplay } from '../utils';
import CountUp from './CountUp';

interface TeamsViewProps {
  transactions: Transaction[];
  teams: Team[];
  onAddTeam: (t: Team) => void;
  onUpdateTeam: (t: Team) => void;
  onDeleteTeam: (id: string) => void;
  onOpenTransaction: (id: string, name: string) => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const TransactionTable: React.FC<{ 
    title: string; 
    data: Transaction[]; 
    onEdit: (t: Transaction) => void; 
    onDelete?: (id: string) => void;
    showDescription?: boolean 
}> = ({ title, data, onEdit, onDelete, showDescription }) => (
    <div className="glass-panel rounded-2xl overflow-hidden mb-8">
        <div className="px-8 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h4 className="label-text text-xs text-gray-400">{title}</h4>
            <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white font-medium">{data.length}</span>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-white/[0.02] text-gray-500 label-text text-[10px]">
                <tr>
                    <th className="px-8 py-3">Data</th>
                    <th className="px-8 py-3">Ref</th>
                    {showDescription && <th className="px-8 py-3">Descrição</th>}
                    <th className="px-8 py-3 text-right">Valor</th>
                    <th className="px-8 py-3 text-right">Pago</th>
                    <th className="px-8 py-3 text-center">Status</th>
                    <th className="px-8 py-3"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {data.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500 text-xs label-text">Nenhum registro encontrado.</td></tr>
                ) : (
                    data.map(t => (
                        <tr key={t.id} className="hover:bg-white/[0.02] group transition-colors">
                            <td className="px-8 py-3 text-gray-400 font-mono text-xs">{formatDateDisplay(t.date)}</td>
                            <td className="px-8 py-3 text-white font-medium">{t.round || 'Avulso'}</td>
                            {showDescription && <td className="px-8 py-3 text-gray-400 italic font-light">{t.notes || t.description || t.category}</td>}
                            <td className="px-8 py-3 text-right text-gray-400 font-mono">{formatCurrency(t.amountDue)}</td>
                            <td className="px-8 py-3 text-right text-white font-medium font-mono">{formatCurrency(t.amountPaid)}</td>
                            <td className="px-8 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] label-text ${
                                    t.status === 'PAID' ? 'text-black bg-[#28F587]' :
                                    t.status === 'PARTIAL' ? 'text-black bg-red-400' : 'text-black bg-white'
                                }`}>{t.status === 'PARTIAL' ? 'Parcial' : t.status === 'PAID' ? 'Pago' : 'Pendente'}</span>
                            </td>
                            <td className="px-8 py-3 text-right flex justify-end gap-2">
                                <button onClick={() => onEdit(t)} className="text-gray-500 hover:text-white transition-colors"><ICONS.Edit size={16} /></button>
                                {onDelete && <button onClick={() => onDelete(t.id)} className="text-gray-500 hover:text-red-500 transition-colors"><ICONS.Delete size={16} /></button>}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const TeamsView: React.FC<TeamsViewProps> = ({ 
    transactions, teams, onAddTeam, onUpdateTeam, onDeleteTeam, onOpenTransaction, onEditTransaction, onDeleteTransaction 
}) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'PROFILE'>('LIST');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setEditLogo(await resizeImage(e.target.files[0]));
    }
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeam && isEditing) {
      onUpdateTeam({ ...selectedTeam, name: editName, logo: editLogo });
      setSelectedTeam({ ...selectedTeam, name: editName, logo: editLogo });
    } else {
      onAddTeam({ id: crypto.randomUUID(), name: editName, logo: editLogo });
    }
    setIsEditing(false);
    setEditName('');
    setEditLogo('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTeam(id);
  };

  const openProfile = (team: Team) => {
    setSelectedTeam(team);
    setViewMode('PROFILE');
  };

  // General Dashboard Calculation
  const generalStats = useMemo(() => {
     const teamsIncome = transactions.filter(t => t.entityType === 'TEAM' && t.type === 'INCOME').reduce((acc, t) => acc + t.amountPaid, 0);
     const teamsDue = transactions.filter(t => t.entityType === 'TEAM').reduce((acc, t) => acc + (t.amountDue - t.amountPaid), 0);
     return { teamsIncome, teamsDue };
  }, [transactions]);

  // Helper to get specific team stats
  const getTeamStats = (teamId: string) => {
    const teamTrans = transactions.filter(t => t.entityId === teamId);
    const paid = teamTrans.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amountPaid, 0);
    const totalDue = teamTrans.reduce((acc, t) => acc + t.amountDue, 0);
    const debt = totalDue - paid;
    return { paid, debt };
  };

  if (viewMode === 'PROFILE' && selectedTeam) {
    const teamTrans = transactions.filter(t => t.entityId === selectedTeam.id).sort((a,b) => b.date.localeCompare(a.date));
    
    // Categorize
    const matchFees = teamTrans.filter(t => t.category === 'Taxa Jogo');
    const regFees = teamTrans.filter(t => t.category === 'Inscrição');
    const otherFees = teamTrans.filter(t => t.category !== 'Taxa Jogo' && t.category !== 'Inscrição');

    const stats = getTeamStats(selectedTeam.id);

    return (
      <div className="space-y-8 animate-stagger">
        <button onClick={() => setViewMode('LIST')} className="text-gray-500 hover:text-white flex items-center gap-2 text-xs label-text pl-1 transition-colors">
          <ICONS.Close className="rotate-180" size={16} /> Back to List
        </button>

        <div className="glass-panel rounded-3xl p-8 relative flex flex-col md:flex-row gap-10 items-center md:items-start group">
          <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setIsEditing(true); setEditName(selectedTeam.name); setEditLogo(selectedTeam.logo || ''); }} className="p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg transition-colors"><ICONS.Edit size={18} /></button>
              <button onClick={(e) => { 
                    onDeleteTeam(selectedTeam.id);
                    setViewMode('LIST');
                    setSelectedTeam(null);
              }} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-lg transition-colors"><ICONS.Delete size={18} /></button>
          </div>

          <div className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-[#28F587] transition-colors">
             <div className="w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                {selectedTeam.logo ? <img src={selectedTeam.logo} className="w-full h-full object-cover" /> : <ICONS.Teams size={48} weight="thin" className="text-white/20" />}
             </div>
          </div>
          <div className="text-center md:text-left w-full">
              <h2 className="text-5xl font-medium text-white tracking-tight mb-6">{selectedTeam.name}</h2>
              <div className="flex gap-6 justify-center md:justify-start">
                  <div className="toxic-input px-6 py-4 rounded-xl">
                      <span className="text-[10px] text-gray-500 label-text block mb-1">Total Paid</span>
                      <span className="text-2xl font-mono font-medium text-[#28F587] tracking-tight">
                        <CountUp end={stats.paid} prefix="R$" />
                      </span>
                  </div>
                  <div className="toxic-input px-6 py-4 rounded-xl">
                      <span className="text-[10px] text-gray-500 label-text block mb-1">Due Amount</span>
                      <span className={`text-2xl font-mono font-medium tracking-tight ${stats.debt > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        <CountUp end={stats.debt} prefix="R$" />
                      </span>
                  </div>
              </div>
          </div>
        </div>

        {isEditing && (
            <div className="glass-panel p-8 rounded-2xl animate-stagger">
               <form onSubmit={handleSaveTeam} className="flex gap-4 items-end">
                   <div className="flex-1">
                       <label className="text-[10px] text-gray-500 label-text mb-2 block">Nome do time</label>
                       <input required value={editName} onChange={e => setEditName(e.target.value)} className="w-full toxic-input rounded-lg p-3 value-text" />
                   </div>
                   <label className="toxic-input p-3 rounded-lg cursor-pointer text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                       <ICONS.Image size={20} /> <span className="text-xs label-text">Logo</span>
                       <input type="file" className="hidden" onChange={handleImageUpload} />
                   </label>
                   <button className="bg-[#28F587] text-black px-8 py-3 rounded-lg label-text shadow-lg shadow-[#28F587]/20 text-xs">Salvar</button>
               </form>
            </div>
        )}

        <div className="flex justify-between items-center mt-12 mb-6">
            <h3 className="text-2xl font-light text-white tracking-tight">History</h3>
            <button onClick={() => onOpenTransaction(selectedTeam.id, selectedTeam.name)} className="px-6 py-3 rounded-lg text-xs label-text flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 border border-white/10 hover:bg-[#28F587] hover:text-black text-white">
                <ICONS.Plus size={16} /> New Entry
            </button>
        </div>

        <TransactionTable title="Match Fees" data={matchFees} onEdit={onEditTransaction} onDelete={onDeleteTransaction} />
        <TransactionTable title="Registration Fees" data={regFees} onEdit={onEditTransaction} onDelete={onDeleteTransaction} showDescription={true} />
        <TransactionTable title="Other" data={otherFees} onEdit={onEditTransaction} onDelete={onDeleteTransaction} />

      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-12 animate-stagger">
       
       {/* General Teams Dashboard */}
       <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
           <div className="flex justify-between items-start mb-6">
               <h3 className="text-xl value-text text-white">Teams Overview</h3>
               <div className="p-2 bg-[#28F587]/10 text-[#28F587] rounded-md"><ICONS.Money size={20} /></div>
           </div>
           <div className="flex gap-12">
               <div>
                   <p className="text-[10px] label-text text-gray-500 mb-1">Total Collected</p>
                   <p className="text-3xl font-medium text-[#28F587] font-mono"><CountUp end={generalStats.teamsIncome} prefix="R$" /></p>
               </div>
               <div>
                   <p className="text-[10px] label-text text-gray-500 mb-1">Total Outstanding</p>
                   <p className="text-3xl font-medium text-white font-mono"><CountUp end={generalStats.teamsDue} prefix="R$" /></p>
               </div>
           </div>
       </div>

       <div className="flex justify-between items-end mb-8">
           <div>
               <h2 className="text-2xl font-light text-white tracking-tight mb-1">Teams List</h2>
               <p className="text-gray-500 font-light text-sm">Active Squads</p>
           </div>
           <button onClick={() => { setIsEditing(true); setEditName(''); setEditLogo(''); setSelectedTeam(null); }} className="bg-[#28F587] text-black px-6 py-3 rounded-lg flex items-center gap-2 label-text shadow-lg shadow-[#28F587]/20 transition-transform hover:scale-[1.02] text-xs">
               <ICONS.Plus size={18} /> New Team
           </button>
       </div>

       {isEditing && !selectedTeam && (
           <div className="glass-panel p-8 rounded-2xl mb-8 animate-stagger">
               <h3 className="value-text text-lg text-white mb-6">Register Team</h3>
               <form onSubmit={handleSaveTeam} className="flex gap-4 items-end">
                   <input required value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 toxic-input p-3 rounded-lg value-text" placeholder="Nome do time" />
                   <button className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-lg label-text text-xs">Salvar</button>
               </form>
           </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {teams.map((team, i) => {
               const stats = getTeamStats(team.id);
               return (
                   <div key={team.id} onClick={() => openProfile(team)} className={`glass-panel rounded-2xl p-6 cursor-pointer group flex flex-col gap-6 animate-stagger stagger-${(i % 3) + 1} relative`}>
                       <button 
                         onClick={(e) => handleDelete(team.id, e)} 
                         className="absolute top-4 right-4 text-gray-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                       >
                           <ICONS.Delete size={16} />
                       </button>
                       
                       <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-[#28F587] flex-shrink-0 transition-colors shadow-lg">
                               {team.logo ? <img src={team.logo} className="w-full h-full object-cover" /> : <span className="text-xl font-medium text-gray-600">{team.name[0]}</span>}
                           </div>
                           <div>
                               <h3 className="value-text text-xl text-white group-hover:text-[#28F587] transition-colors">{team.name}</h3>
                               <p className="text-[10px] text-gray-500 label-text mt-1 flex items-center gap-1">View Profile <ICONS.Search size={10} /></p>
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                            <div>
                                <p className="text-[9px] label-text text-gray-500">Paid</p>
                                <p className="text-sm font-mono text-[#28F587]">{formatCurrency(stats.paid)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] label-text text-gray-500">Due</p>
                                <p className="text-sm font-mono text-white">{formatCurrency(stats.debt)}</p>
                            </div>
                       </div>
                   </div>
               )
           })}
       </div>
    </div>
  );
};

export default TeamsView;