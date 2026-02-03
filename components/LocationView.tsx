import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { ICONS, COURT_HOURLY_RATE } from '../constants';
import { formatCurrency, formatDateDisplay, formatHours } from '../utils';
import CountUp from './CountUp';

interface LocationViewProps {
  transactions: Transaction[];
  onNewEntry: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const LocationView: React.FC<LocationViewProps> = ({ transactions, onNewEntry, onEditTransaction, onDeleteTransaction }) => {
  const [filterMonth, setFilterMonth] = useState('');

  const courtTransactions = useMemo(() => {
     let data = transactions.filter(t => t.entityType === 'COST' && t.category === 'Aluguel Quadra');
     if (filterMonth) data = data.filter(t => t.date.startsWith(filterMonth));
     return data.sort((a,b) => b.date.localeCompare(a.date));
  }, [transactions, filterMonth]);
  
  const totalDue = courtTransactions.reduce((acc, t) => acc + t.amountDue, 0);
  const totalPaid = courtTransactions.reduce((acc, t) => acc + t.amountPaid, 0);
  const totalHours = totalDue / COURT_HOURLY_RATE;

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
             <div className="absolute -right-5 -top-5 p-4 opacity-20 group-hover:opacity-40 transition-opacity"><ICONS.Location size={100} className="text-[#28F587]" weight="thin" /></div>
             <h3 className="text-[#28F587] label-text text-[10px] mb-2">Contracted Total</h3>
             <p className="text-4xl value-text text-white tracking-tighter font-mono">
                <CountUp end={totalDue} prefix="R$" />
             </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl">
             <h3 className="text-gray-500 label-text text-[10px] mb-2">Paid Total</h3>
             <p className="text-4xl value-text text-[#28F587] tracking-tighter font-mono">
                <CountUp end={totalPaid} prefix="R$" />
             </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl">
             <h3 className="text-gray-500 label-text text-[10px] mb-2">Hours (Est. R${COURT_HOURLY_RATE}/h)</h3>
             <p className="text-4xl value-text text-white tracking-tighter font-mono">
                {formatHours(totalHours)}
             </p>
          </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="value-text text-lg text-white tracking-tight">Rental History</h3>
            <input 
                type="month" 
                value={filterMonth} 
                onChange={e => setFilterMonth(e.target.value)} 
                className="toxic-input rounded-lg px-4 py-2 text-xs font-medium outline-none"
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
                                   t.status === 'PARTIAL' ? 'text-black bg-red-400' : 'text-black bg-white'
                                }`}>{t.status === 'PAID' ? 'Pago' : 'Pendente'}</span>
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