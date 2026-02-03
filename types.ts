
export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PENDING' | 'PARTIAL' | 'PAID';

// Categories updated based on new requirements
export type Category = 
  | 'Taxa Jogo' | 'Inscrição' | 'Multa' // Teams
  | 'Pagamento Staff' // Staff (Role is defined in a separate field now, or sub-category)
  | 'Aluguel Quadra' | 'Alimentação' // Costs
  | 'Premiação' | 'Equipamentos' // Expenses
  | 'Outros';

export interface Season {
  id: string;
  name: string; // e.g. "2026 I"
}

export interface Week {
  id: string;
  name: string; // e.g. "#Week 1", "#SuperWeek"
}

export interface Competition {
  id: string;
  name: string;
  seasonId: string; // Link to Season
  rounds: string[]; // List of available rounds
  logo?: string; // Base64
}

export interface Team {
  id: string;
  name: string;
  logo?: string; // Base64
}

export interface StaffMember {
  id: string;
  name: string;
  photo?: string; // Base64
  defaultRole: 'Arbitro' | 'Mesario' | 'Midia' | 'Outro';
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string; 
  
  // Relations
  entityId: string; 
  entityName: string; 
  entityType: 'TEAM' | 'STAFF' | 'COST' | 'EXPENSE' | 'OTHER';
  
  // Detailed Context
  description?: string; // New: Optional description
  matchesWorked?: number; // New: For Staff
  
  seasonId?: string; // New: Season Context
  weekId?: string;   // New: Week Context
  competitionId?: string;
  round?: string; 
  
  // Context
  contextType: 'COMPETITION' | 'EVENT';
  
  // Financials
  amountDue: number;  // A Pagar
  amountPaid: number; // Pago
  status: TransactionStatus;
  
  notes?: string;
  createdAt: number;
}

export interface AppState {
  transactions: Transaction[];
  teams: Team[];
  staff: StaffMember[];
  competitions: Competition[];
  seasons: Season[];
  weeks: Week[];
}
