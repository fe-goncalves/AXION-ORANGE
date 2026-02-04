import React, { useState, useMemo } from 'react';
import { Transaction, Competition, Week } from '../types';
import { ICONS, COURT_HOURLY_RATE } from '../constants';
import { formatCurrency, formatDateDisplay, formatHours } from '../utils';
import CountUp from './CountUp';

interface LocationViewProps {
  transactions: Transaction[];
  competitions?: Competition[];
  weeks?: Week[];
  onNewEntry: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const LocationView: React.FC<LocationViewProps> = ({ transactions, competitions = [], weeks = [], onNewEntry, onEditTransaction, onDeleteTransaction }) => {
  const [filterMonth, setFilterMonth] = useState('');
  const [filterComp, setFilterComp] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterMatchday, setFilterMatchday] = useState('');

  const availableRounds = useMemo(() => {
    const rounds = new Set<string>();
    transactions.forEach(t => { if(t.round && t.category === 'Aluguel Quadra') rounds.add(t.round); });
    return Array.from(rounds).sort();
  }, [transactions]);

  const courtTransactions = useMemo(() => {
     let data = transactions.filter(t => t.entityType === 'COST' && t.category === 'Aluguel Quadra');
     
     if (filterMonth) data = data.filter(t => t.date.startsWith(filterMonth));
     if (filterComp) data = data.filter(t => t.competitionId === filterComp);
     if (filterWeek) data = data.filter(t => t.weekId === filterWeek);
     if (filterMatchday) data = data.filter(t => t.round === filterMatchday);
     
     return data.sort((a,b) => b.date.localeCompare(a.date));
  }, [transactions, filterMonth, filterComp, filterWeek, filterMatchday]);
  
  const totalDue = courtTransactions.reduce((acc, t) => acc + t.amountDue, 0);
  const totalPaid = courtTransactions.reduce((acc, t) => acc + t.amountPaid, 0);
  const totalHours = totalDue / COURT_HOURLY_RATE;

  // Logic: Balance is simply Total Paid - Total Due (Contracted).
  // If Paid < Due, this is negative (Debt/A Pagar on location specific view).
  // If Paid > Due, this is positive (Credit/Surplus).
  const locationSurplus = totalPaid - totalDue;

  return (
    <div className="space-y-12 animate-stagger">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h2 className="text-2xl font-light text-white tracking-tight mb-1">Location</h2>
            <p className="text-gray-500 font-light text-sm">Rentals & Costs</p>
        </div>
        <button onClick={onNewEntry} className="bg-[#28F587] px-8 py-3 rounded-lg text-black transition-all label-text flex items-center gap-2 shadow-lg shadow-[#28F587]/20 hover:scale-[1.02] text-xs">
            <ICONS.Plus size={18} /> New Rental
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
             <div className="absolute -right-5 -top-5 p-4 opacity-20 group-hover:opacity-40 transition-opacity"><ICONS.Location size={100} className="text-[#28F587]" weight="thin" /></div>
             <h3 className="text-[#28F587] label-text text-[10px] mb-2">Contracted Total</h3>
             <p className="text-3xl value-text text-white tracking-tighter font-mono">
                <CountUp end={totalDue} prefix="R$" />
             </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl">
             <h3 className="text-gray-500 label-text text-[10px] mb-2">Paid Total</h3>
             <p className="text-3xl value-text text-[#28F587] tracking-tighter font-mono">
                <CountUp end={totalPaid} prefix="R$" />
             </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl">
             <h3 className="text-gray-500 label-text text-[10px] mb-2">Hours (Est. R${COURT_HOURLY_RATE}/h)</h3>
             <p className="text-3xl value-text text-white tracking-tighter font-mono">
                {formatHours(totalHours)}
             </p>
          </div>
          <div className={`glass-panel p-8 rounded-2xl border-l-2 ${locationSurplus >= 0 ? 'border-l-cyan-400' : 'border-l-red-500'}`}>
             <h3 className={`${locationSurplus >= 0 ? 'text-cyan-400' : 'text-red-500'} label-text text-[10px] mb-2`}>Saldo / Crédito</h3>
             <p className="text-3xl value-text text-white tracking-tighter font-mono">
                <CountUp end={locationSurplus} prefix="R$" />
             </p>
             <p className="text-[9px] text-gray-500 mt-1">Balanço Geral</p>
          </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex flex-wrap items-center gap-4 bg-white/[0.01]">
            <h3 className="value-text text-lg text-white tracking-tight mr-auto">Rental History</h3>
            
            <select value={filterComp} onChange={e => setFilterComp(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587] appearance-none">
                <option value="" className="bg-black text-white">Todas Ligas</option>
                {competitions.map(c => <option key={c.id} value={c.id} className="bg-black text-white">{c.name}</option>)}
            </select>

            <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587] appearance-none">
                <option value="" className="bg-black text-white">Todas Weeks</option>
                {weeks.map(w => <option key={w.id} value={w.id} className="bg-black text-white">{w.name}</option>)}
            </select>
            
            <select value={filterMatchday} onChange={e => setFilterMatchday(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587] appearance-none">
                <option value="" className="bg-black text-white">Todas Rodadas</option>
                {availableRounds.map(r => <option key={r} value={r} className="bg-black text-white">{r}</option>)}
            </select>

            <input 
                type="month" 
                value={filterMonth} 
                onChange={e => setFilterMonth(e.target.value)} 
                className="toxic-input rounded-lg px-4 py-1.5 text-xs font-medium outline-none"
            />
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] text-gray-500 text-[10px] label-text">
                    <tr>
                        <th className="px-8 py-4">Data</th>
                        <th className="px-8 py-4">Referência</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4 text-right">A Pagar</th>
                        <th className="px-8 py-4 text-right">Pago</th>
                        <th className="px-8 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {courtTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-8 py-4 text-gray-400 font-mono text-xs font-medium">{formatDateDisplay(t.date)}</td>
                            <td className="px-8 py-4 text-white font-medium">
                                {t.entityName} <span className="text-gray-500 text-[10px] block mt-1 label-text">{t.round || t.competitionId || 'Avulso'}</span>
                            </td>
                            <td className="px-8 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] label-text ${
                                   t.status === 'PAID' ? 'text-black bg-[#28F587]' : 
                                   t.status === 'EXCEDENTE' ? 'text-black bg-cyan-400' : 
                                   t.status === 'PARTIAL' ? 'text-black bg-red-400' : 'text-black bg-white'
                                }`}>{t.status === 'PAID' ? 'Pago' : t.status === 'EXCEDENTE' ? 'Excedente' : t.status === 'PARTIAL' ? 'Parcial' : 'Pendente'}</span>
                            </td>
                            <td className="px-8 py-4 text-right text-gray-400 font-mono">{formatCurrency(t.amountDue)}</td>
                            <td className="px-8 py-4 text-right text-white font-medium font-mono">{formatCurrency(t.amountPaid)}</td>
                            <td className="px-8 py-4 text-right flex justify-end gap-2">
                                <button onClick={() => onEditTransaction(t)} className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"><ICONS.Edit size={16} /></button>
                                <button onClick={() => onDeleteTransaction(t.id)} className="text-red-400 hover:text-white p-2 rounded-lg hover:bg-red-500 transition-colors"><ICONS.Delete size={16} /></button>
                            </td>
                        </tr>
                    ))}
                    {courtTransactions.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-gray-500 text-xs label-text">Nenhum registro encontrado.</td></tr>}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default LocationView;