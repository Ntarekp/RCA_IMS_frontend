
export type ViewState = 'DASHBOARD' | 'STOCK' | 'TRANSACTIONS' | 'ANALYTICS' | 'REPORT' | 'SUPPLIERS' | 'SETTINGS' | 'NOTIFICATIONS' | 'PROFILE' | 'USERS';

export type DrawerType = 'NONE' | 'STOCK_DETAIL' | 'SUPPLIER_DETAIL' | 'ORDER_FORM' | 'ADD_STOCK' | 'ADD_SUPPLIER' | 'EDIT_PROFILE' | 'CHANGE_PASSWORD' | 'STOCK_IN' | 'STOCK_OUT' | 'DELETE_ITEM' | 'ADD_USER' | 'EDIT_TRANSACTION' | 'REVERSE_TRANSACTION';

export interface StockItem {
  id: string;
  name: string;
  category: string;
  status: 'Birahagije' | 'Mucye' | 'Byashize';
  currentQuantity: number;
  minimumQuantity: number;
  unit: string;
  lastUpdated: string;
  description?: string; // Added for detail view
  location?: string; // Added for detail view
  supplierId?: string; // Linked supplier
  totalIn?: number; // Added for stats
  totalOut?: number; // Added for stats
}

export interface DashboardItem {
  id: string;
  name: string;
  unit: string;
  quantityIn: number;
  quantityRemaining: number;
  quantityDamaged: number;
  quantityThreshold: number;
  status: 'Birahagije' | 'Hafi gushira' | 'Byashize';
  date: string;
}

export interface Activity {
  id: string;
  timeAgo: string;
  quantity: string;
  type: 'IN' | 'OUT';
  reason: string;
  processedBy: string;
}

export interface UserProfile {
  id?: number;
  name: string;
  role: string;
  email: string;
  department: string;
  phone: string;
  joinDate: string;
  avatarUrl?: string;
  location?: string; // Added for profile view
  // Settings
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  twoFactorAuth?: boolean;
  theme?: 'LIGHT' | 'DARK';
  language?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  itemsSupplied: string[];
  address?: string; // Added for detail view
  rating?: number; // Added for detail view
  lastDelivery?: string; // Added for detail view
  totalOrders?: number; // Added for detail view
}

export interface SystemReport {
  id: string;
  title: string;
  type: 'STOCK' | 'FINANCIAL' | 'AUDIT';
  generatedDate: string;
  size: string;
  status: 'READY' | 'PROCESSING';
  format: 'PDF' | 'CSV';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  timestamp: string;
  read: boolean;
}

export interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  twoFactorAuth: boolean;
  theme: 'LIGHT' | 'DARK';
  language: string;
}
