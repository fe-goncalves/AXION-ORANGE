import { 
  SquaresFour, 
  UsersThree, 
  UserGear, 
  MapPin, 
  Scroll, 
  Plus, 
  DownloadSimple, 
  UploadSimple, 
  Trash, 
  CheckCircle, 
  Clock,
  CurrencyDollar,
  Trophy,
  WarningCircle,
  PencilSimple,
  Faders,
  MagnifyingGlass,
  Image as ImageIcon,
  X,
  CalendarBlank,
  Gear,
  ArrowDown,
  ArrowUp,
  Receipt,
  CaretDown,
  CalendarPlus,
  Hash
} from '@phosphor-icons/react';

export const ICONS = {
  Dashboard: SquaresFour,
  Teams: UsersThree,
  Staff: UserGear,
  Location: MapPin,
  Costs: Receipt,
  Ledger: Scroll,
  Plus: Plus,
  Download: DownloadSimple,
  Upload: UploadSimple,
  Delete: Trash,
  Paid: CheckCircle,
  Pending: Clock,
  Money: CurrencyDollar,
  Trophy: Trophy,
  Alert: WarningCircle,
  Edit: PencilSimple,
  Filter: Faders,
  Search: MagnifyingGlass,
  Image: ImageIcon,
  Close: X,
  Date: CalendarBlank,
  Settings: Gear,
  DownloadArrow: ArrowDown,
  UploadArrow: ArrowUp,
  ChevronDown: CaretDown,
  Season: CalendarPlus,
  Week: Hash
};

export const CATEGORY_GROUPS = {
  TEAM: ['Taxa Jogo', 'Inscrição', 'Multa', 'Outros'],
  STAFF: ['Arbitro', 'Mesario', 'Midia', 'Outros'],
  COST: ['Aluguel Quadra', 'Alimentação', 'Outros'],
  EXPENSE: ['Premiação', 'Equipamentos', 'Logística', 'Marketing', 'Outros']
};

export const COURT_HOURLY_RATE = 90;

export const INITIAL_TEAMS = [
  { id: '1', name: 'Orange Ballers' },
  { id: '2', name: 'Black Mambas' },
];

export const INITIAL_STAFF = [
  { id: '1', name: 'Carlos Juiz', defaultRole: 'Arbitro' },
];

export const INITIAL_SEASONS = [
  { id: '1', name: '2025 I' },
  { id: '2', name: '2025 II' }
];

export const INITIAL_WEEKS = [
  { id: '1', name: '#Week 1' },
  { id: '2', name: '#Week 2' },
  { id: '3', name: '#SuperWeek' }
];

export const INITIAL_COMPETITIONS = [
  { 
    id: '1', 
    name: 'Liga Orange 2025', 
    seasonId: '1', 
    rounds: ['Rodada 1', 'Rodada 2', 'Rodada 3', 'Semifinal', 'Final'] 
  }
];
