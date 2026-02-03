import React, { useState, useEffect, useRef } from 'react';
import { ICONS, CATEGORY_GROUPS, COURT_HOURLY_RATE } from '../constants';
import { Transaction, TransactionType, Team, StaffMember, Competition, Season, Week } from '../types';
import { maskCurrency, parseCurrency, formatDateDisplay } from '../utils';

interface CustomSelectProps {
  options: { id: string; label: string; image?: string; subLabel?: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  defaultIcon: any;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder, defaultIcon: DefaultIcon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full rounded-xl px-4 py-4 flex items-center justify-between cursor-pointer group ${isOpen ? 'shadow-[0_0_15px_rgba(40,245,135,0.2)]' : ''} toxic-select-trigger`}
      >
         <div className="flex items-center gap-3 overflow-hidden">
            {selectedOption ? (
                <>
                  <div className="w-6 h-6 rounded bg-white/10 flex-shrink-0 overflow-hidden">
                      {selectedOption.image ? <img src={selectedOption.image} className="w-full h-full object-cover" /> : <div className="p-1"><DefaultIcon size={14} className="w-full h-full text-gray-400" /></div>}
                  </div>
                  <div className="flex flex-col leading-none">
                      <span className="text-white text-sm value-text">{selectedOption.label}</span>
                      {selectedOption.subLabel && <span className="text-[10px] text-gray-400 mt-0.5 label-text">{selectedOption.subLabel}</span>}
                  </div>
                </>
            ) : (
                <span className="text-gray-500 text-sm font-light">{placeholder}</span>
            )}
         </div>
         <div className="text-[#28F587] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
             <ICONS.ChevronDown size={16} weight="bold" />
         </div>
      </div>

      {isOpen && (
         <div className="absolute top-full left-0 w-full mt-2 toxic-select-menu rounded-xl max-h-60 overflow-y-auto z-50">
             {options.map(opt => (
                 <div 
                    key={opt.id} 
                    onClick={() => { onChange(opt.id); setIsOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-white/5 last:border-0 toxic-option transition-colors"
                 >
                    <div className="w-8 h-8 rounded bg-white/5 flex-shrink-0 overflow-hidden">
                        {opt.image ? <img src={opt.image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><DefaultIcon size={16} className="text-gray-400" /></div>}
                    </div>
                    <div>
                        <p className="text-white text-sm font-medium">{opt.label}</p>
                        {opt.subLabel && <p className="text-[10px] text-gray-500 label-text">{opt.subLabel}</p>}
                    </div>
                 </div>
             ))}
             {options.length === 0 && <div className="p-4 text-center text-gray-500 text-sm">Nenhuma opção disponível</div>}
         </div>
      )}
    </div>
  );
};


interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  teams: Team[];
  staff: StaffMember[];
  competitions: Competition[];
  seasons: Season[];
  weeks: Week[];
  initialData?: Transaction | null;
  prefillEntity?: { type: string, id: string, name: string, category?: string };
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, onClose, onSave, teams, staff, competitions, seasons, weeks, initialData, prefillEntity 
}) => {
  const [type, setType] = useState<TransactionType>('INCOME');
  
  // Date Handling
  const [displayDate, setDisplayDate] = useState(''); // DD/MM/AA
  
  const [entityType, setEntityType] = useState<'TEAM' | 'STAFF' | 'COST' | 'EXPENSE' | 'OTHER'>('TEAM');
  const [entityId, setEntityId] = useState<string>('');
  const [customEntity, setCustomEntity] = useState<string>('');
  
  const [category, setCategory] = useState<string>('');
  
  // Context Fields
  const [weekId, setWeekId] = useState<string>('');
  const [competitionId, setCompetitionId] = useState<string>('');
  const [round, setRound] = useState<string>('');
  
  // Additional Detail Fields
  const [description, setDescription] = useState<string>('');
  const [matchesWorked, setMatchesWorked] = useState<number>(0);

  const [amountDueStr, setAmountDueStr] = useState<string>('0,00');
  const [amountPaidStr, setAmountPaidStr] = useState<string>('0,00');
  const [courtHours, setCourtHours] = useState<number>(1);
  const [status, setStatus] = useState<'PENDING' | 'PARTIAL' | 'PAID'>('PENDING');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        // Convert YYYY-MM-DD to DD/MM/YY for display
        const [y, m, d] = initialData.date.split('-');
        setDisplayDate(`${d}/${m}/${y.slice(2)}`);

        setEntityType(initialData.entityType);
        setEntityId(initialData.entityId);
        
        if (['COST', 'EXPENSE', 'OTHER'].includes(initialData.entityType)) {
          setCustomEntity(initialData.entityName);
        } else {
          setCustomEntity('');
        }

        setCategory(initialData.category);
        
        // Load Context
        setWeekId(initialData.weekId || '');
        setCompetitionId(initialData.competitionId || '');
        setRound(initialData.round || '');
        
        // Load Details
        setDescription(initialData.description || '');
        setMatchesWorked(initialData.matchesWorked || 0);

        setAmountDueStr(maskCurrency((initialData.amountDue * 100).toFixed(0)));
        setAmountPaidStr(maskCurrency((initialData.amountPaid * 100).toFixed(0)));

        if (initialData.category === 'Aluguel Quadra' && initialData.amountDue > 0) {
            setCourtHours(initialData.amountDue / COURT_HOURLY_RATE);
        }

      } else {
        resetForm();
        if (prefillEntity) {
          setEntityType(prefillEntity.type as any);
          setEntityId(prefillEntity.id);
          if (prefillEntity.name) setCustomEntity(prefillEntity.name);
          if (prefillEntity.category) setCategory(prefillEntity.category);
          
          if (prefillEntity.type === 'COST' && !prefillEntity.category) {
             setCategory(CATEGORY_GROUPS.COST[0]);
          }
        }
      }
    }
  }, [initialData, isOpen, prefillEntity]);

  const resetForm = () => {
    setType('INCOME');
    
    // Set today as DD/MM/YY
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = String(today.getFullYear()).slice(2);
    setDisplayDate(`${d}/${m}/${y}`);

    setEntityType('TEAM');
    setEntityId('');
    setCustomEntity('');
    setCategory('');
    setWeekId('');
    setCompetitionId('');
    setRound('');
    setDescription('');
    setMatchesWorked(0);
    setAmountDueStr('0,00');
    setAmountPaidStr('0,00');
    setCourtHours(1);
  };

  const handleDateChange = (val: string) => {
    // Mask DD/MM/AA
    let v = val.replace(/\D/g, '');
    if (v.length > 6) v = v.slice(0, 6);
    
    if (v.length > 4) {
        v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length > 2) {
        v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    setDisplayDate(v);
  };

  useEffect(() => {
    if (category === 'Aluguel Quadra') {
       const calculatedCost = courtHours * COURT_HOURLY_RATE;
       setAmountDueStr(maskCurrency((calculatedCost * 100).toFixed(0)));
       setType('EXPENSE'); 
    }
  }, [courtHours, category]); 

  useEffect(() => {
    const due = parseCurrency(amountDueStr);
    const paid = parseCurrency(amountPaidStr);

    if (paid >= due && due > 0) {
      setStatus('PAID');
    } else if (paid > 0 && paid < due) {
      setStatus('PARTIAL'); 
    } else {
      setStatus('PENDING');
    }
  }, [amountDueStr, amountPaidStr]);

  useEffect(() => {
    if (!initialData && isOpen && !prefillEntity?.category) {
        if (entityType === 'TEAM') setCategory(CATEGORY_GROUPS.TEAM[0]);
        if (entityType === 'STAFF') setCategory(CATEGORY_GROUPS.STAFF[0]);
        if (entityType === 'COST') setCategory(CATEGORY_GROUPS.COST[0]);
        if (entityType === 'EXPENSE') setCategory(CATEGORY_GROUPS.EXPENSE[0]);
    }
  }, [entityType, initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalEntityName = customEntity;
    let finalEntityId = entityId;

    if (entityType === 'TEAM') {
      const t = teams.find(x => x.id === entityId);
      finalEntityName = t ? t.name : 'Unknown Team';
    } else if (entityType === 'STAFF') {
      const s = staff.find(x => x.id === entityId);
      finalEntityName = s ? s.name : 'Unknown Staff';
    } else {
        finalEntityId = 'GENERIC'; 
    }

    // Convert DD/MM/YY to YYYY-MM-DD
    let isoDate = new Date().toISOString().split('T')[0]; // Default fallback
    if (displayDate.length === 8) {
        const [d, m, y] = displayDate.split('/');
        isoDate = `20${y}-${m}-${d}`;
    }

    // Infer Season from Competition
    let derivedSeasonId = '';
    const comp = competitions.find(c => c.id === competitionId);
    if (comp && comp.seasonId) {
        derivedSeasonId = comp.seasonId;
    }

    onSave({
      type,
      date: isoDate,
      entityType,
      entityId: finalEntityId,
      entityName: finalEntityName,
      category,
      description,
      matchesWorked,
      seasonId: derivedSeasonId || undefined, // Use derived
      weekId: weekId || undefined,
      competitionId: competitionId || undefined,
      round: round || undefined,
      contextType: competitionId ? 'COMPETITION' : 'EVENT',
      amountDue: parseCurrency(amountDueStr),
      amountPaid: parseCurrency(amountPaidStr),
      status
    });
    
    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = 
    entityType === 'TEAM' ? CATEGORY_GROUPS.TEAM :
    entityType === 'STAFF' ? CATEGORY_GROUPS.STAFF :
    entityType === 'COST' ? CATEGORY_GROUPS.COST :
    entityType === 'EXPENSE' ? CATEGORY_GROUPS.EXPENSE : ['Outros'];

  const selectedCompetition = competitions.find(c => c.id === competitionId);
  
  // Conditional rendering flags
  const showDescription = (entityType === 'TEAM' && ['Inscrição', 'Multa', 'Outros'].includes(category)) || entityType === 'STAFF';
  const showMatchesWorked = entityType === 'STAFF';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-stagger duration-200">
      <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h2 className="text-2xl value-text text-white tracking-tight">
              {initialData ? 'Editar movimentação' : 'Nova movimentação'}
            </h2>
            <p className="text-xs text-gray-500 mt-1 label-text">Financial Details</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-white/5 p-3 rounded-full hover:bg-white/10">
            <ICONS.Close size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1 overflow-y-auto">
          
          {/* Row 1: Type & Date - z-index 30 for safety */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-30">
            <div className="flex bg-black p-1.5 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`flex-1 py-3 rounded-lg label-text text-xs transition-all ${type === 'INCOME' ? 'bg-[#28F587] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`flex-1 py-3 rounded-lg label-text text-xs transition-all ${type === 'EXPENSE' ? 'bg-red-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Saída
              </button>
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    required
                    placeholder="DD/MM/AA"
                    value={displayDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full toxic-input rounded-xl px-4 py-4 outline-none value-text text-sm"
                />
            </div>
          </div>

          {/* Row 2: Entity Selection - z-index 20 to be above Row 3 */}
          <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4 relative z-20">
             <div className="flex flex-wrap gap-2">
                 {[
                     {id: 'TEAM', label: 'Team'}, 
                     {id: 'STAFF', label: 'Staff'}, 
                     {id: 'COST', label: 'Location'}, 
                     {id: 'EXPENSE', label: 'Costs'}
                 ].map(opt => (
                     <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEntityType(opt.id as any)}
                        className={`text-[10px] label-text px-4 py-2.5 rounded-lg transition-all border ${
                            entityType === opt.id 
                            ? 'bg-white text-black border-white' 
                            : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-white'
                        }`}
                     >
                         {opt.label}
                     </button>
                 ))}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-[10px] text-gray-500 label-text mb-2 block">Entidade</label>
                    {entityType === 'TEAM' && (
                        <CustomSelect 
                            options={teams.map(t => ({ id: t.id, label: t.name, image: t.logo }))}
                            value={entityId}
                            onChange={setEntityId}
                            placeholder="Selecione o time"
                            defaultIcon={ICONS.Teams}
                        />
                    )}
                    {entityType === 'STAFF' && (
                        <CustomSelect 
                            options={staff.map(s => ({ id: s.id, label: s.name, image: s.photo, subLabel: s.defaultRole }))}
                            value={entityId}
                            onChange={setEntityId}
                            placeholder="Selecione o staff"
                            defaultIcon={ICONS.Staff}
                        />
                    )}
                    {(entityType === 'COST' || entityType === 'EXPENSE') && (
                        <input 
                            required 
                            placeholder={entityType === 'COST' ? "Ex: Quadra 1" : "Ex: Troféus, Taxas..."}
                            value={customEntity} 
                            onChange={e => setCustomEntity(e.target.value)} 
                            className="w-full toxic-input rounded-xl px-4 py-4 outline-none value-text text-sm"
                        />
                    )}
                 </div>

                 <div>
                    <label className="text-[10px] text-gray-500 label-text mb-2 block">
                        {entityType === 'STAFF' ? 'Função' : 'Categoria'}
                    </label>
                    <select 
                        required
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full toxic-select-trigger rounded-xl px-4 py-4 outline-none value-text text-sm bg-transparent appearance-none"
                    >
                        {currentCategories.map(c => <option key={c} value={c} className="bg-black text-white">{c}</option>)}
                    </select>
                 </div>
             </div>

             {/* Dynamic Fields for Description & Matches */}
             {(showDescription || showMatchesWorked) && (
                <div className="pt-4 border-t border-white/5 animate-stagger grid grid-cols-1 md:grid-cols-2 gap-4">
                     {showDescription && (
                         <div className={showMatchesWorked ? '' : 'col-span-2'}>
                            <label className="text-[10px] text-gray-500 label-text mb-2 block">Descrição / Obs</label>
                            <textarea
                                rows={1}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full toxic-input rounded-xl px-4 py-3 outline-none value-text text-sm min-h-[50px]"
                                placeholder="Detalhes adicionais..."
                            />
                         </div>
                     )}
                     {showMatchesWorked && (
                         <div>
                             <label className="text-[10px] text-gray-500 label-text mb-2 block">Partidas Trabalhadas</label>
                             <input 
                                type="number"
                                min="0"
                                value={matchesWorked}
                                onChange={e => setMatchesWorked(parseInt(e.target.value) || 0)}
                                className="w-full toxic-input rounded-xl px-4 py-3 outline-none value-text text-sm"
                             />
                         </div>
                     )}
                </div>
             )}
          </div>

          {/* Row 3: Context / Competition - z-index 10 to be above Row 4 */}
          <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4 relative z-10">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-medium text-gray-300 label-text flex items-center gap-2">
                   <ICONS.Trophy size={16} className="text-[#28F587]" /> Contexto do Evento
                </h3>
             </div>
             
             {/* New: Week ONLY (Season removed as per request) */}
             <div className="pb-4 border-b border-white/5 mb-4">
                 <div>
                    <label className="text-[10px] text-gray-500 label-text mb-2 block flex items-center gap-2"><ICONS.Week size={12}/> #Week / Evento</label>
                    <div className="relative">
                        <select 
                            value={weekId} 
                            onChange={(e) => setWeekId(e.target.value)}
                            className="w-full toxic-select-trigger rounded-xl px-4 py-4 outline-none value-text text-sm bg-transparent appearance-none"
                        >
                            <option value="" className="bg-black text-white">Selecione...</option>
                            {weeks.map(w => <option key={w.id} value={w.id} className="bg-black text-white">{w.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#28F587] pointer-events-none">
                            <ICONS.ChevronDown size={16} />
                        </div>
                    </div>
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-[10px] text-gray-500 label-text mb-2 block">Competição / Liga</label>
                    <div className="relative">
                        <select 
                            value={competitionId} 
                            onChange={(e) => { setCompetitionId(e.target.value); setRound(''); }}
                            className="w-full toxic-select-trigger rounded-xl px-4 py-4 outline-none value-text text-sm bg-transparent appearance-none"
                        >
                            <option value="" className="bg-black text-white">Nenhuma (Avulso)</option>
                            {competitions.map(c => <option key={c.id} value={c.id} className="bg-black text-white">{c.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#28F587] pointer-events-none">
                            <ICONS.ChevronDown size={16} />
                        </div>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] text-gray-500 label-text mb-2 block">Rodada / Matchday</label>
                     <div className="relative">
                        <select 
                            disabled={!competitionId}
                            value={round} 
                            onChange={(e) => setRound(e.target.value)}
                            className={`w-full toxic-select-trigger rounded-xl px-4 py-4 outline-none value-text text-sm bg-transparent appearance-none ${!competitionId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <option value="" className="bg-black text-white">Selecione...</option>
                            {selectedCompetition ? (
                                selectedCompetition.rounds.map(r => <option key={r} value={r} className="bg-black text-white">{r}</option>)
                            ) : (
                                <option value="" className="bg-black text-white">Selecione uma liga primeiro</option>
                            )}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#28F587] pointer-events-none">
                            <ICONS.ChevronDown size={16} />
                        </div>
                     </div>
                 </div>
             </div>
          </div>

          {/* Court Calculation Logic */}
          {category === 'Aluguel Quadra' && (
             <div className="bg-[#28F587]/10 border border-[#28F587]/20 p-6 rounded-xl flex items-center justify-between relative z-0">
                <div>
                  <label className="text-[10px] text-[#28F587] label-text mb-2 block">Cálculo de horas</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={courtHours}
                      onChange={(e) => setCourtHours(parseFloat(e.target.value))}
                      className="w-20 bg-black/50 border border-[#28F587]/30 rounded-lg p-2 text-white font-mono text-center outline-none focus:border-[#28F587]"
                    />
                    <span className="text-xs text-gray-400 label-text">x R$ {COURT_HOURLY_RATE},00</span>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-gray-500 label-text">Total estimado</p>
                   <p className="text-2xl font-mono value-text text-white">
                      {(courtHours * COURT_HOURLY_RATE).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </p>
                </div>
             </div>
          )}

          {/* Row 4: Financials - z-index 0 */}
          <div className="bg-black/40 rounded-2xl p-6 border border-white/5 relative z-0">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs font-medium text-gray-300 label-text flex items-center gap-2">
                     <ICONS.Money size={16} className="text-[#28F587]" /> Financeiro
                 </h3>
                 <span className={`text-[10px] px-3 py-1 rounded label-text ${
                     status === 'PAID' ? 'bg-[#28F587] text-black' : 
                     status === 'PARTIAL' ? 'bg-red-400 text-black' : 'bg-white text-black'
                 }`}>
                     {status === 'PAID' ? 'Pago' : status === 'PARTIAL' ? 'Parcial' : 'Pendente'}
                 </span>
             </div>
             
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <label className="block text-[10px] text-gray-500 mb-2 label-text">Valor total</label>
                   <div className="relative">
                      <span className="absolute left-0 top-1 text-gray-600 font-medium text-lg">R$</span>
                      <input 
                        type="text"
                        value={amountDueStr}
                        onChange={(e) => setAmountDueStr(maskCurrency(e.target.value))}
                        className="w-full bg-transparent text-white pl-8 py-1 border-b border-white/10 focus:border-[#28F587] outline-none font-mono text-3xl font-light transition-colors"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] text-gray-500 mb-2 label-text">Valor pago</label>
                   <div className="relative">
                      <span className="absolute left-0 top-1 text-gray-600 font-medium text-lg">R$</span>
                      <input 
                        type="text" 
                        value={amountPaidStr}
                        onChange={(e) => setAmountPaidStr(maskCurrency(e.target.value))}
                        className={`w-full bg-transparent text-white pl-8 py-1 border-b ${status === 'PARTIAL' ? 'border-red-400' : 'border-white/10'} focus:border-[#28F587] outline-none font-mono text-3xl font-light transition-colors`}
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="flex gap-4 pt-4 relative z-0">
             <button type="button" onClick={onClose} className="flex-1 py-4 bg-transparent border border-white/10 hover:border-white/30 text-white rounded-xl label-text text-xs transition-colors">Cancelar</button>
             <button type="submit" className="flex-1 py-4 bg-[#28F587] text-black rounded-xl label-text shadow-[0_0_15px_rgba(40,245,135,0.2)] transition-transform hover:scale-[1.02] text-xs">
                {initialData ? 'Salvar alterações' : 'Confirmar'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;