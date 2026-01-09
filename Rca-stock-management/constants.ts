import { StockItem, DashboardItem, Activity, Supplier, SystemReport, NotificationItem, UserProfile, UserSettings } from './types';

// These mock constants are kept for fallback or testing purposes
// In production, data should come from the API

export const MOCK_CHART_DATA = [
  { name: 'Jan', in: 1.8, out: 0.8 },
  { name: 'Feb', in: 3.5, out: 5.0 },
  { name: 'Mar', in: 1.8, out: 3.0 },
  { name: 'Apr', in: 1.8, out: 3.0 },
  { name: 'May', in: 1.8, out: 0.8 },
  { name: 'Jun', in: 3.6, out: 2.4 },
  { name: 'Jul', in: 2.2, out: 1.4 },
  { name: 'Aug', in: 1.8, out: 2.6 },
  { name: 'Sep', in: 1.8, out: 2.5 },
  { name: 'Oct', in: 1.8, out: 2.6 },
  { name: 'Nov', in: 1.8, out: 1.9 },
  { name: 'Dec', in: 1.8, out: 0.9 },
];

export const MOCK_ANALYTICS_TRENDS = [
  { month: 'Jul', consumption: 4000, waste: 240, restock: 4500 },
  { month: 'Aug', consumption: 3000, waste: 139, restock: 3200 },
  { month: 'Sep', consumption: 2000, waste: 980, restock: 2100 },
  { month: 'Oct', consumption: 2780, waste: 390, restock: 2900 },
  { month: 'Nov', consumption: 1890, waste: 480, restock: 2181 },
  { month: 'Dec', consumption: 2390, waste: 380, restock: 2500 },
];

export const MOCK_CATEGORY_DISTRIBUTION = [
  { subject: 'Grains', A: 120, fullMark: 150 },
  { subject: 'Vegetables', A: 98, fullMark: 150 },
  { subject: 'Dairy', A: 86, fullMark: 150 },
  { subject: 'Meat', A: 99, fullMark: 150 },
  { subject: 'Spices', A: 85, fullMark: 150 },
  { subject: 'Liquids', A: 65, fullMark: 150 },
];

export const MOCK_REPORTS: SystemReport[] = [
  { id: '1', title: 'Monthly Stock Summary', type: 'STOCK', generatedDate: 'Oct 30, 2023', size: '24 KB', status: 'READY', format: 'PDF' },
  { id: '2', title: 'Q3 Financial Audit', type: 'FINANCIAL', generatedDate: 'Oct 15, 2023', size: '41 KB', status: 'READY', format: 'CSV' },
  { id: '3', title: 'Supplier Performance Review', type: 'AUDIT', generatedDate: 'Sep 30, 2023', size: '12 KB', status: 'READY', format: 'PDF' },
  { id: '4', title: 'Weekly Consumption Log', type: 'STOCK', generatedDate: 'Oct 28, 2023', size: '8 KB', status: 'READY', format: 'CSV' },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'Low Stock Alert', message: 'Rice inventory has dropped below minimum threshold.', type: 'ALERT', timestamp: '2 mins ago', read: false },
  { id: '2', title: 'System Update', message: 'System maintenance scheduled for tonight at 2 AM.', type: 'INFO', timestamp: '1 hour ago', read: true },
  { id: '3', title: 'New Supplier Added', message: 'Kigali Grains Ltd has been approved as a supplier.', type: 'SUCCESS', timestamp: '3 hours ago', read: false },
  { id: '4', title: 'Stock Discrepancy', message: 'Physical count for Beans differs from system record.', type: 'WARNING', timestamp: '1 day ago', read: true },
  { id: '5', title: 'Weekly Report Ready', message: 'Your weekly consumption report is ready for download.', type: 'INFO', timestamp: '2 days ago', read: true },
];
