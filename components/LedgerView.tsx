import React, { useMemo, useState } from 'react';
import { Transaction, Competition, Team, Season, Week } from '../types';
import { ICONS } from '../constants';
import { formatCurrency, formatDateDisplay } from '../utils';

interface LedgerViewProps {
  transactions: Transaction[];
  competitions: Competition[];
  teams: Team[];
  seasons: Season[];
  weeks: Week[];
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
}

const LedgerView: React.FC<LedgerViewProps> = ({ transactions, competitions, teams, seasons, weeks, onDelete, onEdit }) => {
  const [filterMonth, setFilterMonth] = useState('');
  const [filterComp, setFilterComp] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterGroup, setFilterGroup] = useState(''); // New Filter for Section/Group
  const [filterMatchday, setFilterMatchday] = useState('');
  const [filterSeason, setFilterSeason] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    let data = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter by Month
    if (filterMonth) data = data.filter(t => t.date.startsWith(filterMonth));
    
    // Filter by Group/Section (Module logic)
    if (filterGroup) {
        if (filterGroup === 'TEAM') {
            data = data.filter(t => t.entityType === 'TEAM');
        } else if (filterGroup === 'STAFF') {
            data = data.filter(t => t.entityType === 'STAFF');
        } else if (filterGroup === 'LOCATION') {
            // Location view generally handles 'Aluguel Quadra'
            data = data.filter(t => t.category === 'Aluguel Quadra');
        } else if (filterGroup === 'COSTS') {
            // General Costs logic: Expense, not Staff, not Location
            data = data.filter(t => 
                t.type === 'EXPENSE' && 
                t.entityType !== 'STAFF' && 
                t.category !== 'Aluguel Quadra'
            );
        }
    }

    if (filterComp) data = data.filter(t => t.competitionId === filterComp);
    if (filterTeam) data = data.filter(t => t.entityId === filterTeam);
    if (filterType) data = data.filter(t => t.type === filterType);
    if (filterMatchday) data = data.filter(t => t.round === filterMatchday);
    if (filterSeason) data = data.filter(t => t.seasonId === filterSeason);
    if (filterWeek) data = data.filter(t => t.weekId === filterWeek);
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(t => 
        t.entityName.toLowerCase().includes(lower) || 
        t.category.toLowerCase().includes(lower) ||
        (t.round && t.round.toLowerCase().includes(lower))
      );
    }
    return data;
  }, [transactions, filterMonth, filterGroup, filterComp, filterTeam, filterType, filterMatchday, filterSeason, filterWeek, searchTerm]);

  const totalSum = useMemo(() => {
      let income = 0;
      let expense = 0;
      filteredData.forEach(t => {
          if(t.type === 'INCOME') income += t.amountPaid;
          else expense += t.amountPaid;
      });
      return income - expense;
  }, [filteredData]);

  // Extract unique rounds for filter
  const availableRounds = useMemo(() => {
      const rounds = new Set<string>();
      transactions.forEach(t => { if(t.round) rounds.add(t.round); });
      return Array.from(rounds).sort();
  }, [transactions]);

  return (
    <div className="space-y-12 animate-stagger">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
            <h2 className="text-2xl font-light text-white tracking-tight mb-1">Ledger</h2>
            <p className="text-gray-500 font-light text-sm">All financial records</p>
        </div>
        <div className="relative w-full md:w-96 group">
           <ICONS.Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-[#28F587] transition-colors" size={16} />
           <input 
             placeholder="SEARCH..." 
             className="w-full toxic-input rounded-xl pl-10 pr-6 py-3 text-sm value-text placeholder-gray-600 label-text"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="glass-panel p-5 rounded-xl flex flex-wrap gap-4 items-center">
        <span className="text-gray-500 text-[10px] label-text flex items-center gap-2 pr-4 border-r border-white/10"><ICONS.Filter size={14} /> Filters</span>
        
        {/* Month/Year Filter (Already existed) */}
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587]" />
        
        {/* Season Filter */}
        <select value={filterSeason} onChange={e => setFilterSeason(e.target.value)} className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587] appearance-none">
            <option value="" className="bg-black text-white">Season</option>
            {seasons.map(s => <option key={s.id} value={s.id} className="bg-black text-white">{s.name}</option>)}
        </select>

        {/* Week Filter */}
        <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587] appearance-none">
            <option value="" className="bg-black text-white">Week</option>
            {weeks.map(w => <option key={w.id} value={w.id} className="bg-black text-white">{w.name}</option>)}
        </select>

        {/* New Group Filter */}
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587] appearance-none">
            <option value="" className="bg-black text-white">Todos Grupos</option>
            <option value="TEAM" className="bg-black text-white">Times (Equipes)</option>
            <option value="STAFF" className="bg-black text-white">Staff (RH)</option>
            <option value="LOCATION" className="bg-black text-white">Local (Quadra)</option>
            <option value="COSTS" className="bg-black text-white">Custos Gerais</option>
        </select>

        <select value={filterComp} onChange={e => setFilterComp(e.target.value)} className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587] appearance-none">
            <option value="" className="bg-black text-white">Todas Ligas</option>
            {competitions.map(c => <option key={c.id} value={c.id} className="bg-black text-white">{c.name}</option>)}
        </select>
        
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587] appearance-none">
            <option value="" className="bg-black text-white">Todas Equipes</option>
            {teams.map(t => <option key={t.id} value={t.id} className="bg-black text-white">{t.name}</option>)}
        </select>
        
        <select value={filterMatchday} onChange={e => setFilterMatchday(e.target.value)} className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587] appearance-none">
            <option value="" className="bg-black text-white">Todas Rodadas</option>
            {availableRounds.map(r => <option key={r} value={r} className="bg-black text-white">{r}</option>)}
        </select>

        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-[#28F587] appearance-none">
            <option value="" className="bg-black text-white">Entrada/Saida</option>
            <option value="INCOME" className="bg-black text-white">Entrada</option>
            <option value="EXPENSE" className="bg-black text-white">Saída</option>
        </select>
      </div>
      
      {/* Total Display for current view */}
      <div className="flex justify-end">
          <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-4">
              <span className="text-xs label-text text-gray-500">Saldo do Período/Filtro:</span>
              <span className={`text-xl font-mono font-medium ${totalSum >= 0 ? 'text-[#28F587]' : 'text-red-400'}`}>
                  {formatCurrency(totalSum)}
              </span>
          </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/[0.02] text-gray-500 label-text text-[10px]">
                    <tr>
                        <th className="px-8 py-5">Data</th>
                        <th className="px-8 py-5">Entidade</th>
                        <th className="px-8 py-5">Detalhes</th>
                        <th className="px-8 py-5 text-right">A Pagar</th>
                        <th className="px-8 py-5 text-right">Pago</th>
                        <th className="px-8 py-5 text-center">Status</th>
                        <th className="px-8 py-5 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {filteredData.map(row => (
                        <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => onEdit(row)}>
                            <td className="px-8 py-5 text-gray-500 font-mono text-xs font-medium">{formatDateDisplay(row.date)}</td>
                            <td className="px-8 py-5 font-medium text-white text-base">{row.entityName}</td>
                            <td className="px-8 py-5">
                                <div className="flex flex-col">
                                    <span className="text-gray-300 font-medium text-xs label-text">{row.category}</span>
                                    <span className="text-[10px] text-gray-600 mt-0.5 font-medium">{row.round || 'Avulso'}</span>
                                </div>
                            </td>
                            <td className={`px-8 py-5 text-right font-medium text-gray-500 font-mono`}>
                                {row.type === 'EXPENSE' && '- '}{formatCurrency(row.amountDue)}
                            </td>
                            <td className={`px-8 py-5 text-right font-medium font-mono text-base ${row.type === 'INCOME' ? 'text-[#28F587]' : 'text-red-400'}`}>
                                {formatCurrency(row.amountPaid)}
                            </td>
                            <td className="px-8 py-5 text-center">
                                <span className={`px-3 py-1 rounded-md text-[10px] label-text ${
                                    row.status === 'PAID' ? 'text-black bg-[#28F587]' : 
                                    row.status === 'PARTIAL' ? 'text-black bg-red-400' :
                                    'text-black bg-white'
                                }`}>
                                    {row.status === 'PAID' ? 'Pago' : row.status === 'PARTIAL' ? 'Faltante' : 'Pendente'}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                                <button onClick={() => onDelete(row.id)} className="text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors"><ICONS.Delete size={16} /></button>
                            </td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr><td colSpan={7} className="p-12 text-center text-gray-500 text-xs label-text">Nenhum registro encontrado para os filtros selecionados.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default LedgerView;