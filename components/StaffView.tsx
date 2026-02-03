import React, { useState, useMemo } from 'react';
import { Transaction, StaffMember } from '../types';
import { ICONS } from '../constants';
import { resizeImage, formatCurrency, formatDateDisplay } from '../utils';
import CountUp from './CountUp';

interface StaffViewProps {
  transactions: Transaction[];
  staff: StaffMember[];
  onAddStaff: (s: StaffMember) => void;
  onUpdateStaff: (s: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onOpenTransaction: (id: string, name: string) => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const StaffView: React.FC<StaffViewProps> = ({ 
    transactions, staff, onAddStaff, onUpdateStaff, onDeleteStaff, onOpenTransaction, onEditTransaction, onDeleteTransaction 
}) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'PROFILE'>('LIST');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Arbitro');
  const [photo, setPhoto] = useState('');

  // Dashboard State
  const [filterMonth, setFilterMonth] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPhoto(await resizeImage(e.target.files[0]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaff && viewMode === 'PROFILE') {
        const updated = { ...selectedStaff, name, defaultRole: role as any, photo };
        onUpdateStaff(updated);
        setSelectedStaff(updated);
        setIsEditing(false);
    } else {
        onAddStaff({ id: crypto.randomUUID(), name, defaultRole: role as any, photo });
        resetForm();
    }
  };

  const resetForm = () => {
      setIsEditing(false); setName(''); setRole('Arbitro'); setPhoto('');
  }
  
  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteStaff(id);
  };

  const openProfile = (s: StaffMember) => {
      setSelectedStaff(s);
      setViewMode('PROFILE');
  }

  // --- Aggregate Logic ---
  const aggregatedStats = useMemo(() => {
    let filtered = transactions.filter(t => t.entityType === 'STAFF');
    if (filterMonth) filtered = filtered.filter(t => t.date.startsWith(filterMonth));
    if (filterRole) filtered = filtered.filter(t => t.category === filterRole);

    const totalPaid = filtered.reduce((acc, t) => acc + t.amountPaid, 0);
    const totalDue = filtered.reduce((acc, t) => acc + t.amountDue, 0);

    return { totalPaid, totalDue, count: filtered.length };
  }, [transactions, filterMonth, filterRole]);
  
  const getStaffStats = (staffId: string) => {
      const staffTrans = transactions.filter(t => t.entityId === staffId);
      const paid = staffTrans.reduce((acc, t) => acc + t.amountPaid, 0);
      const due = staffTrans.reduce((acc, t) => acc + (t.amountDue - t.amountPaid), 0);
      return { paid, due };
  }

  // --- PROFILE VIEW ---
  if (viewMode === 'PROFILE' && selectedStaff) {
      const staffTrans = transactions.filter(t => t.entityId === selectedStaff.id).sort((a,b) => b.date.localeCompare(a.date));
      const stats = getStaffStats(selectedStaff.id);

      return (
        <div className="space-y-8 animate-stagger">
           <button onClick={() => setViewMode('LIST')} className="text-gray-500 hover:text-white flex items-center gap-2 text-xs label-text pl-1 transition-colors">
             <ICONS.Close className="rotate-180" size={16} /> Back
           </button>

           <div className="glass-panel rounded-3xl p-10 relative flex flex-col md:flex-row gap-10 items-center group">
              <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => { setIsEditing(true); setName(selectedStaff.name); setRole(selectedStaff.defaultRole); setPhoto(selectedStaff.photo||''); }} className="p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg transition-colors"><ICONS.Edit size={18} /></button>
                 <button onClick={() => { 
                        onDeleteStaff(selectedStaff.id);
                        setViewMode('LIST');
                        setSelectedStaff(null);
                 }} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-lg transition-colors"><ICONS.Delete size={18} /></button>
              </div>

              <div className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 shadow-2xl p-1 group-hover:border-[#28F587] transition-colors">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                    {selectedStaff.photo ? <img src={selectedStaff.photo} className="w-full h-full object-cover" /> : <ICONS.Staff size={48} weight="thin" className="text-white/20" />}
                  </div>
              </div>
              <div className="text-center md:text-left w-full">
                  <h2 className="text-4xl font-medium text-white tracking-tight leading-none mb-3">{selectedStaff.name}</h2>
                  <span className="inline-block bg-white/5 text-gray-400 px-3 py-1 rounded text-xs label-text border border-white/5">{selectedStaff.defaultRole}</span>
                  <div className="flex gap-6 mt-8 justify-center md:justify-start">
                      <div className="toxic-input px-6 py-4 rounded-xl">
                          <span className="text-[10px] text-gray-500 label-text block mb-1">Received</span>
                          <span className="text-2xl font-mono font-medium text-[#28F587]">
                            <CountUp end={stats.paid} prefix="R$" />
                          </span>
                      </div>
                      <div className="toxic-input px-6 py-4 rounded-xl">
                          <span className="text-[10px] text-gray-500 label-text block mb-1">Pending</span>
                          <span className={`text-2xl font-mono font-medium ${stats.due > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                            <CountUp end={stats.due} prefix="R$" />
                          </span>
                      </div>
                  </div>
              </div>
           </div>

           {isEditing && (
               <div className="glass-panel p-8 rounded-2xl animate-stagger">
                   <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
                       <div className="flex-1 min-w-[200px]">
                           <label className="text-[10px] text-gray-500 label-text mb-2 block">Nome</label>
                           <input value={name} onChange={e => setName(e.target.value)} className="w-full toxic-input rounded-lg p-3 value-text" />
                       </div>
                       <div className="min-w-[150px]">
                           <label className="text-[10px] text-gray-500 label-text mb-2 block">Função</label>
                           <select value={role} onChange={e => setRole(e.target.value)} className="w-full toxic-input rounded-lg p-3 value-text bg-transparent appearance-none">
                               <option className="bg-black text-white">Arbitro</option>
                               <option className="bg-black text-white">Mesario</option>
                               <option className="bg-black text-white">Midia</option>
                               <option className="bg-black text-white">Outro</option>
                           </select>
                       </div>
                       <label className="toxic-input p-3 rounded-lg cursor-pointer text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                           <ICONS.Image size={20} /> <span className="text-xs label-text">Foto</span>
                           <input type="file" className="hidden" onChange={handleImage} />
                       </label>
                       <button className="bg-[#28F587] text-black px-8 py-3 rounded-lg label-text shadow-lg shadow-[#28F587]/20 text-xs">Salvar</button>
                   </form>
               </div>
           )}

           <div className="flex justify-between items-center mt-10">
                <h3 className="text-2xl font-light text-white tracking-tight">Statement</h3>
                <button onClick={() => onOpenTransaction(selectedStaff.id, selectedStaff.name)} className="px-6 py-3 rounded-lg text-xs label-text flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 border border-white/10 hover:bg-[#28F587] hover:text-black text-white">
                    <ICONS.Plus size={16} /> New Payment
                </button>
           </div>

           <div className="glass-panel rounded-2xl overflow-hidden mb-8">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/[0.02] text-gray-500 text-[10px] label-text">
                        <tr>
                            <th className="px-8 py-4">Data</th>
                            <th className="px-8 py-4">Função</th>
                            <th className="px-8 py-4">Evento</th>
                            <th className="px-8 py-4 text-right">Valor</th>
                            <th className="px-8 py-4 text-right">Pago</th>
                            <th className="px-8 py-4 text-center">Status</th>
                            <th className="px-8 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {staffTrans.map(t => (
                            <tr key={t.id} className="hover:bg-white/[0.02] group transition-colors">
                                <td className="px-8 py-4 text-gray-400 font-mono text-xs">{formatDateDisplay(t.date)}</td>
                                <td className="px-8 py-4 font-medium text-white">{t.category}</td>
                                <td className="px-8 py-4 text-gray-400 text-xs uppercase font-medium">{t.round || t.competitionId ? 'Liga' : 'Evento'}</td>
                                <td className="px-8 py-4 text-right text-gray-400 font-mono">{formatCurrency(t.amountDue)}</td>
                                <td className="px-8 py-4 text-right text-white font-medium font-mono">{formatCurrency(t.amountPaid)}</td>
                                <td className="px-8 py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] label-text ${t.status === 'PAID' ? 'text-black bg-[#28F587]' : 'text-black bg-white'}`}>{t.status === 'PAID' ? 'Pago' : 'Pendente'}</span>
                                </td>
                                <td className="px-8 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => onEditTransaction(t)} className="text-gray-500 hover:text-white transition-colors"><ICONS.Edit size={16} /></button>
                                    <button onClick={() => onDeleteTransaction(t.id)} className="text-gray-500 hover:text-red-500 transition-colors"><ICONS.Delete size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
           </div>
        </div>
      );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-12 animate-stagger">
      
      {/* General Staff Dashboard */}
      <div className="glass-panel rounded-2xl p-8 relative overflow-hidden group">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
             <h3 className="text-xl value-text text-white flex items-center gap-3">
                 <div className="p-2 bg-[#28F587]/10 text-[#28F587] rounded-md"><ICONS.Money size={20} /></div>
                 HR Costs
             </h3>
             <div className="flex gap-3">
                 <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="toxic-input rounded-lg px-3 py-2 text-xs font-medium" />
                 <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="toxic-input rounded-lg px-3 py-2 text-xs font-medium bg-transparent appearance-none">
                     <option className="bg-black text-white" value="">Todas Funções</option>
                     <option className="bg-black text-white">Arbitro</option>
                     <option className="bg-black text-white">Mesario</option>
                     <option className="bg-black text-white">Midia</option>
                 </select>
             </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="toxic-input p-5 rounded-xl">
                 <span className="text-[10px] text-gray-500 label-text">Total Paid</span>
                 <p className="text-3xl font-medium text-[#28F587] mt-1 tracking-tight font-mono">
                    <CountUp end={aggregatedStats.totalPaid} prefix="R$" />
                 </p>
             </div>
             <div className="toxic-input p-5 rounded-xl">
                 <span className="text-[10px] text-gray-500 label-text">To Pay</span>
                 <p className="text-3xl font-medium text-red-400 mt-1 tracking-tight font-mono">
                    <CountUp end={aggregatedStats.totalDue - aggregatedStats.totalPaid} prefix="R$" />
                 </p>
             </div>
             <div className="toxic-input p-5 rounded-xl">
                 <span className="text-[10px] text-gray-500 label-text">Total Events</span>
                 <p className="text-3xl font-medium text-white mt-1 tracking-tight font-mono">
                    <CountUp end={aggregatedStats.count} />
                 </p>
             </div>
         </div>
      </div>

      <div className="flex justify-between items-end mb-8">
        <div>
            <h2 className="text-2xl font-light text-white tracking-tight mb-1">Staff</h2>
            <p className="text-gray-500 font-light text-sm">Referees & Contractors</p>
        </div>
        <button onClick={() => { setIsEditing(true); setName(''); setPhoto(''); setSelectedStaff(null); }} className="bg-[#28F587] text-black px-6 py-3 rounded-lg flex items-center gap-2 label-text shadow-lg shadow-[#28F587]/20 transition-transform hover:scale-[1.02] text-xs">
           <ICONS.Plus size={18} /> New Staff
        </button>
      </div>

      {isEditing && !selectedStaff && (
         <div className="glass-panel p-8 rounded-2xl mb-8 animate-stagger">
            <h3 className="value-text text-lg text-white mb-6">Register Staff</h3>
            <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] text-gray-500 label-text mb-2 block">Nome completo</label>
                    <input required value={name} onChange={e => setName(e.target.value)} className="w-full toxic-input rounded-lg p-3 value-text" />
                </div>
                <div className="min-w-[150px]">
                    <label className="text-[10px] text-gray-500 label-text mb-2 block">Função</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full toxic-input rounded-lg p-3 value-text bg-transparent appearance-none">
                        <option className="bg-black text-white">Arbitro</option>
                        <option className="bg-black text-white">Mesario</option>
                        <option className="bg-black text-white">Midia</option>
                        <option className="bg-black text-white">Outro</option>
                    </select>
                </div>
                <button className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-lg label-text text-xs">Salvar</button>
            </form>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {staff.map((s, i) => {
            const stats = getStaffStats(s.id);
            return (
                <div key={s.id} onClick={() => openProfile(s)} className={`glass-panel rounded-2xl p-6 cursor-pointer group animate-stagger stagger-${(i % 4) + 1} relative flex flex-col gap-4`}>
                    <button onClick={(e) => handleDelete(s.id, e)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <ICONS.Delete size={16} />
                    </button>
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-[#28F587] shadow-md transition-colors">
                            {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ICONS.Staff className="text-white/20" /></div>}
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="value-text text-white text-lg truncate group-hover:text-[#28F587] transition-colors">{s.name}</h3>
                            <p className="text-[10px] label-text text-gray-500 mt-1">{s.defaultRole}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                        <div>
                            <p className="text-[9px] label-text text-gray-500">Paid</p>
                            <p className="text-sm font-mono text-[#28F587]">{formatCurrency(stats.paid)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] label-text text-gray-500">Due</p>
                            <p className="text-sm font-mono text-white">{formatCurrency(stats.due)}</p>
                        </div>
                   </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default StaffView;