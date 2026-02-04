import React, { useMemo } from 'react';
import { Transaction, Team, StaffMember } from '../types';
import { ICONS } from '../constants';
import CountUp from './CountUp';
import { formatCurrency } from '../utils';

interface DashboardProps {
  transactions: Transaction[];
  onNewClick: () => void;
  teams?: Team[];
  staff?: StaffMember[];
}

const StatCard: React.FC<{ label: string; value: number; trendColor: string; icon: any; delay: string }> = ({ label, value, trendColor, icon: Icon, delay }) => (
  <div className={`glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[140px] group animate-stagger ${delay}`}>
    <div className="flex justify-between items-start">
      <p className="text-gray-400 text-[10px] label-text">{label}</p>
      <div className="text-gray-500 group-hover:text-[#28F587] transition-colors">
        <Icon size={20} weight="thin" />
      </div>
    </div>
    <div className="mt-2">
      <h3 className={`text-3xl value-text ${trendColor} tracking-tight`}>
        <CountUp end={value} />
      </h3>
      <span className="text-[10px] text-gray-600 font-light mt-1 block tracking-wider uppercase">BRL Currency</span>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ transactions, onNewClick }) => {
  const stats = useMemo(() => {
    let balance = 0;
    let receivables = 0;
    let payables = 0;

    transactions.forEach(t => {
      const due = t.amountDue;
      const paid = t.amountPaid;

      if (t.type === 'INCOME') {
        // CORRECTION: General Balance must reflect actual Cash Flow (Ledger Logic).
        // "Valores excedentes em entradas devem aparecer integralmente no SALDO GERAL"
        // We sum the full Amount Paid, regardless if it's partial, exact, or excess.
        balance += paid;
        
        // Receivables: Only what is left to receive. Floor at 0 (Excess payments don't reduce total receivables below 0)
        receivables += Math.max(0, due - paid);
      } else {
        // EXPENSE (Including 'Aluguel Quadra')
        
        // CORRECTION: General Balance subtracts the actual money that left the wallet.
        balance -= paid;
        
        // Payables Logic (A PAGAR):
        // 1. PENDENTE (Paid <= 0): Adds full 'due'.
        // 2. PARCIAL (Paid < Due): Adds remainder (due - paid).
        // 3. PAGO/EXCEDENTE (Paid >= Due): Adds 0.
        payables += Math.max(0, due - paid);
      }
    });

    // Panoramas logic
    // Teams: Income - Expenses (usually fees paid by teams)
    const teamsIncome = transactions.filter(t => t.entityType === 'TEAM' && t.type === 'INCOME').reduce((acc, t) => acc + t.amountPaid, 0);
    // Fix: Floor receivables at 0
    const teamsReceivable = transactions.filter(t => t.entityType === 'TEAM' && t.type === 'INCOME').reduce((acc, t) => acc + Math.max(0, t.amountDue - t.amountPaid), 0);
    
    // Staff: Expenses paid to staff
    const staffPaid = transactions.filter(t => t.entityType === 'STAFF').reduce((acc, t) => acc + t.amountPaid, 0);
    // Fix: Floor due at 0
    const staffDue = transactions.filter(t => t.entityType === 'STAFF').reduce((acc, t) => acc + Math.max(0, t.amountDue - t.amountPaid), 0);

    // Location: Rent paid
    const locationPaid = transactions.filter(t => t.category === 'Aluguel Quadra').reduce((acc, t) => acc + t.amountPaid, 0);
    
    // General Costs
    const generalCostsPaid = transactions.filter(t => t.entityType === 'EXPENSE' || (t.entityType === 'COST' && t.category !== 'Aluguel Quadra')).reduce((acc, t) => acc + t.amountPaid, 0);


    return { balance, receivables, payables, teamsIncome, teamsReceivable, staffPaid, staffDue, locationPaid, generalCostsPaid };
  }, [transactions]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-stagger">
        <div>
           <h2 className="text-2xl font-light text-white tracking-tight mb-1">Financial Overview</h2>
           <p className="text-gray-500 font-light text-sm">Real-time data processing.</p>
        </div>
        <button 
          onClick={onNewClick}
          className="bg-[#28F587] text-black px-6 py-3 rounded-lg font-medium text-xs shadow-[0_0_20px_rgba(40,245,135,0.2)] flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 uppercase tracking-widest hover:shadow-[0_0_30px_rgba(40,245,135,0.4)]"
        >
          <ICONS.Plus size={16} weight="bold" />
          Nova Movimentação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="SALDO GERAL" 
          value={stats.balance} 
          trendColor={stats.balance >= 0 ? "text-white" : "text-red-400"} 
          icon={ICONS.Money}
          delay="stagger-1"
        />
        <StatCard 
          label="A Receber" 
          value={stats.receivables} 
          trendColor="text-[#28F587]" 
          icon={ICONS.Pending}
          delay="stagger-2"
        />
        <StatCard 
          label="A Pagar" 
          value={stats.payables} 
          trendColor="text-red-400" 
          icon={ICONS.Ledger}
          delay="stagger-3"
        />
      </div>

      {/* PANORAMAS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-stagger stagger-3">
         <div className="glass-panel p-5 rounded-xl border-l-2 border-l-[#28F587]">
             <h4 className="text-[10px] label-text text-gray-400 mb-1">Teams Income</h4>
             <p className="text-xl value-text text-white">{formatCurrency(stats.teamsIncome)}</p>
             <p className="text-[9px] text-[#28F587] mt-1">+ {formatCurrency(stats.teamsReceivable)} pending</p>
         </div>
         <div className="glass-panel p-5 rounded-xl border-l-2 border-l-white">
             <h4 className="text-[10px] label-text text-gray-400 mb-1">Staff Costs</h4>
             <p className="text-xl value-text text-white">{formatCurrency(stats.staffPaid)}</p>
             <p className="text-[9px] text-red-400 mt-1">+ {formatCurrency(stats.staffDue)} pending</p>
         </div>
         <div className="glass-panel p-5 rounded-xl border-l-2 border-l-white">
             <h4 className="text-[10px] label-text text-gray-400 mb-1">Location Paid</h4>
             <p className="text-xl value-text text-white">{formatCurrency(stats.locationPaid)}</p>
         </div>
         <div className="glass-panel p-5 rounded-xl border-l-2 border-l-red-500">
             <h4 className="text-[10px] label-text text-gray-400 mb-1">Other Costs</h4>
             <p className="text-xl value-text text-white">{formatCurrency(stats.generalCostsPaid)}</p>
         </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 animate-stagger stagger-4">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs text-white label-text">
               Recent Activity
            </h3>
            <button className="text-[10px] label-text text-[#28F587] hover:text-white transition-colors">View All</button>
         </div>
         
         <div className="space-y-2">
             {transactions.length === 0 ? (
               <p className="text-gray-600 font-light py-12 text-center text-xs uppercase tracking-widest">No activity recorded.</p>
             ) : (
               transactions.slice(-5).reverse().map(t => (
                 <div key={t.id} className="p-4 flex justify-between items-center bg-transparent hover:bg-white/[0.02] rounded-lg transition-colors group cursor-default border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-6">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/5 group-hover:border-[#28F587]/30 transition-colors ${t.type === 'INCOME' ? 'text-[#28F587]' : 'text-red-400'}`}>
                          {t.type === 'INCOME' ? <ICONS.DownloadArrow size={14} /> : <ICONS.UploadArrow size={14} />}
                       </div>
                       <div>
                          <p className="font-medium text-gray-200 text-sm group-hover:text-[#28F587] transition-colors">{t.entityName}</p>
                          <p className="text-[10px] uppercase font-medium text-gray-600 mt-0.5 tracking-wider">{t.category} • {t.date}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={`font-medium font-mono text-sm ${t.type === 'INCOME' ? 'text-[#28F587]' : 'text-white'}`}>
                         {t.type === 'EXPENSE' ? '- ' : '+ '}{t.amountDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                       </p>
                       <span className={`text-[9px] px-2 py-0.5 rounded font-medium uppercase tracking-widest mt-1 inline-block ${
                         t.status === 'PAID' ? 'text-black bg-[#28F587]' : 
                         t.status === 'EXCEDENTE' ? 'text-black bg-cyan-400' :
                         t.status === 'PARTIAL' ? 'text-black bg-red-400' : 'text-black bg-white'
                       }`}>{t.status === 'PARTIAL' ? 'Parcial' : t.status === 'PAID' ? 'Pago' : t.status === 'EXCEDENTE' ? 'Excedente' : 'Pendente'}</span>
                    </div>
                 </div>
               ))
             )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;