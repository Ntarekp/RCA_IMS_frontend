import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StockCard } from './components/StockCard';
import { DashboardTable } from './components/DashboardTable';
import { TransactionsTable } from './components/TransactionsTable';
import { DashboardStats } from './components/DashboardStats';
import { DashboardCharts } from './components/DashboardCharts';
import { AnalyticsStats } from './components/AnalyticsStats';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { RecentActivity } from './components/RecentActivity';
import { SupplierCard } from './components/SupplierCard';
import { SettingsView } from './components/SettingsView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { ReportsView } from './components/ReportsView';
import { DetailDrawer } from './components/DetailDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { LoginView } from './components/LoginView';
import { ViewState, DrawerType, StockItem, Supplier, UserProfile } from './types';
import { MOCK_SUPPLIERS, MOCK_USER_PROFILE } from './constants';
import { useItems } from './hooks/useItems';
import { useReports } from './hooks/useReports';
import { useTransactions } from './hooks/useTransactions';
import { CreateItemRequest, CreateTransactionRequest } from './api/types';
import { ApiError } from './api/client';
import { 
  Calendar, 
  ChevronDown, 
  List, 
  FileSpreadsheet, 
  PlusCircle, 
  Plus, 
  Upload, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCcw,
  Loader2,
  Filter,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  History,
  Box,
  Truck,
  User,
  Shield,
  Briefcase
} from 'lucide-react';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dateRange, setDateRange] = useState('This Month');

  // API Hooks
  const { items: stockItems, loading: itemsLoading, error: itemsError, addItem, refetch: refetchItems } = useItems();
  const { dashboardItems, loading: reportsLoading, error: reportsError, balanceReport, refetch: refetchReports } = useReports();
  const { transactions, loading: transactionsLoading, error: transactionsError, addTransaction, refetch: refetchTransactions } = useTransactions();

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<DrawerType>('NONE');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Toast Helpers
  const addToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Logic Handlers
  const handleLogin = () => {
      setIsLoggedIn(true);
      addToast('Welcome back, Prince Neza!', 'success');
  };

  const handleLogout = () => {
      setIsLoggedIn(false);
      setView('DASHBOARD');
      addToast('Logged out successfully.', 'info');
  };

    // AI report generator using real data
    const handleGenerateReport = async () => {
        setLoadingReport(true);
        setAiReport(null);
        const id = addToast("Analyzing inventory data...", 'loading');
        try {
            // Refresh reports to get latest data
            await refetchReports();
            await new Promise((res) => setTimeout(res, 1500));
            
            const totalItems = stockItems.length;
            const lowStockCount = balanceReport.filter(item => item.isLowStock).length;
            const criticalCount = balanceReport.filter(item => item.status === 'CRITICAL').length;
            const adequateCount = totalItems - lowStockCount;
            
            const report = `# Inventory Analysis\n\n## Summary\n- **Total Items**: ${totalItems}\n- **Adequate Stock**: ${adequateCount}\n- **Low Stock**: ${lowStockCount}\n- **Critical**: ${criticalCount}\n\n## Stock Health\n${criticalCount > 0 ? `⚠️ **CRITICAL**: ${criticalCount} item(s) are out of stock and need immediate attention.\n\n` : ''}${lowStockCount > 0 ? `⚠️ **LOW STOCK**: ${lowStockCount} item(s) are below minimum threshold.\n\n` : ''}${adequateCount === totalItems ? '✅ All items are sufficiently stocked.\n\n' : ''}## Recommendations\n${criticalCount > 0 ? '- **URGENT**: Restock critical items immediately\n' : ''}${lowStockCount > 0 ? '- **PLAN**: Order low stock items before they run out\n' : ''}${adequateCount === totalItems ? '- **MAINTAIN**: Current stock levels are healthy\n' : ''}\n> Analysis generated from real-time inventory data.`;
            setAiReport(report);
            removeToast(id);
            addToast("Analysis generated successfully!", 'success');
        } catch (e) {
            removeToast(id);
            addToast("Failed to generate analysis.", 'error');
        }
        setLoadingReport(false);
    };

  const handleExport = (type: string) => {
    const id = addToast(`Generating ${type} export...`, 'loading');
    setTimeout(() => {
        removeToast(id);
        addToast(`${type} file downloaded successfully.`, 'success');
    }, 2000);
  };

  const handleDateFilter = (range: string) => {
    setDateRange(range);
    addToast(`Filter updated: ${range}`, 'success');
  };

  // Drawer Openers
  const openStockDetail = (item: StockItem) => {
    setSelectedItem(item);
    setDrawerType('STOCK_DETAIL');
    setDrawerOpen(true);
  };

  const openSupplierDetail = (supplier: Supplier) => {
    setSelectedItem(supplier);
    setDrawerType('SUPPLIER_DETAIL');
    setDrawerOpen(true);
  };

  const openOrderForm = (supplier: Supplier) => {
    setSelectedItem(supplier);
    setDrawerType('ORDER_FORM');
    setDrawerOpen(true);
  };

  const openAddStock = () => {
    setSelectedItem(null);
    setDrawerType('ADD_STOCK');
    setDrawerOpen(true);
  };

  const openAddSupplier = () => {
    setSelectedItem(null);
    setDrawerType('ADD_SUPPLIER');
    setDrawerOpen(true);
  };

  const openEditProfile = () => {
      setSelectedItem(MOCK_USER_PROFILE);
      setDrawerType('EDIT_PROFILE');
      setDrawerOpen(true);
  };

  const openChangePassword = () => {
      setSelectedItem(null);
      setDrawerType('CHANGE_PASSWORD');
      setDrawerOpen(true);
  };

  // Close Drawer
  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
        setDrawerType('NONE');
        setSelectedItem(null);
    }, 300);
  };

  // Drawer Content Renders
  const renderDrawerContent = () => {
    if (drawerType === 'STOCK_DETAIL' && selectedItem) {
        const item = selectedItem as StockItem;
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs text-slate-500 mb-1">Current Stock</div>
                        <div className="text-2xl font-bold text-slate-800">{item.currentQuantity} <span className="text-sm font-normal text-slate-500">{item.unit}</span></div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs text-slate-500 mb-1">Status</div>
                        <div className={`text-sm font-bold px-2 py-1 rounded-full w-fit ${
                            item.status === 'Birahagije' ? 'bg-emerald-100 text-emerald-700' :
                            item.status === 'Mucye' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{item.status}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm flex items-center gap-2">
                            <Box className="w-4 h-4 text-slate-400" />
                            {item.category}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Threshold</label>
                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm">
                            {item.minimumQuantity} {item.unit}
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Last Updated</label>
                         <div className="flex items-center gap-2 text-sm text-slate-500">
                             <Clock className="w-4 h-4" />
                             {item.lastUpdated}
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    if (drawerType === 'ADD_STOCK') {
        return (
            <form id="add-stock-form" className="space-y-5" onSubmit={async (e) => { 
                e.preventDefault(); 
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                
                const itemData: CreateItemRequest = {
                    name: formData.get('name') as string,
                    unit: formData.get('unit') as string,
                    minimumStock: parseInt(formData.get('minimumStock') as string),
                    description: formData.get('description') as string || undefined,
                };

                const initialQuantity = parseInt(formData.get('initialQuantity') as string) || 0;

                try {
                    const toastId = addToast("Creating item...", 'loading');
                    const newItem = await addItem(itemData);
                    removeToast(toastId);
                    
                    // If initial quantity is provided, create an IN transaction
                    if (initialQuantity > 0 && newItem.id) {
                        const transactionData: CreateTransactionRequest = {
                            itemId: parseInt(newItem.id),
                            transactionType: 'IN',
                            quantity: initialQuantity,
                            transactionDate: new Date().toISOString().split('T')[0],
                            notes: 'Initial stock',
                            recordedBy: 'System',
                        };
                        await addTransaction(transactionData);
                    }
                    
                    addToast("Stock item added successfully.", 'success');
                    closeDrawer();
                    await refetchItems();
                    await refetchReports();
                } catch (error) {
                    const errorMessage = error instanceof ApiError 
                        ? error.message 
                        : 'Failed to create item. Please try again.';
                    addToast(errorMessage, 'error');
                }
            }}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name</label>
                    <input name="name" type="text" placeholder="e.g. Rice (Gikongoro)" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                        <input name="description" type="text" placeholder="Category or description" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
                        <select name="unit" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required>
                            <option value="">Select unit...</option>
                            <option>Kg</option>
                            <option>Liters</option>
                            <option>Pieces</option>
                            <option>Bags</option>
                            <option>Sacks</option>
                            <option>Boxes</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Quantity (Optional)</label>
                        <input name="initialQuantity" type="number" min="0" placeholder="0" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Threshold</label>
                        <input name="minimumStock" type="number" min="1" placeholder="10" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
            </form>
        );
    }

    if (drawerType === 'ADD_SUPPLIER') {
        return (
            <form id="add-supplier-form" className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeDrawer(); addToast("Supplier profile created successfully."); }}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                    <input type="text" placeholder="e.g. Kigali Grains Ltd" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Person</label>
                    <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Full Name" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="tel" placeholder="+250 7..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" placeholder="contact@supplier.com" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Items Supplied</label>
                    <textarea placeholder="List main items supplied..." className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-24"></textarea>
                </div>
            </form>
        );
    }
    
    if (drawerType === 'SUPPLIER_DETAIL' && selectedItem) {
        const supplier = selectedItem as Supplier;
        return (
            <div className="space-y-6">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-3 text-slate-700">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{supplier.contact}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{supplier.email}</span>
                    </div>
                     <div className="flex items-center gap-3 text-slate-700">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">Kigali, Nyarugenge District</span>
                    </div>
                </div>
                
                 {/* Supplies List */}
                <div>
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-500" />
                        Supplied Items
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {supplier.itemsSupplied.map((item, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 shadow-sm">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (drawerType === 'ORDER_FORM' && selectedItem) {
        return (
             <form id="order-form" className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeDrawer(); addToast(`Order request sent to ${selectedItem.name}`); }}>
                 <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm flex gap-3">
                    <div className="bg-white p-1 rounded-full h-fit"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                    You are placing an order request to <strong>{selectedItem.name}</strong>.
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Item</label>
                    <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        {(selectedItem as Supplier).itemsSupplied.map((item, i) => <option key={i}>{item}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity</label>
                    <input type="number" placeholder="Amount" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Delivery Instructions</label>
                    <textarea placeholder="Any specific requirements..." className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-24"></textarea>
                </div>
             </form>
        )
    }

    if (drawerType === 'EDIT_PROFILE' && selectedItem) {
        const profile = selectedItem as UserProfile;
        return (
             <form id="edit-profile-form" className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeDrawer(); addToast("Profile updated successfully"); }}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input type="text" defaultValue={profile.name} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                         <input type="text" defaultValue={profile.role} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" readOnly />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                         <input type="text" defaultValue={profile.department} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                     <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" defaultValue={profile.email} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="tel" defaultValue={profile.phone} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
            </form>
        );
    }

    if (drawerType === 'CHANGE_PASSWORD') {
        return (
             <form id="change-password-form" className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeDrawer(); addToast("Password changed successfully"); }}>
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600">
                    <p>Make sure your new password is at least 8 characters long and includes a number.</p>
                 </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
            </form>
        );
    }

    return <div className="text-slate-400 text-center py-10">Select an item to view details</div>;
  };

  const getDrawerTitle = () => {
    switch(drawerType) {
        case 'STOCK_DETAIL': return 'Item Details';
        case 'SUPPLIER_DETAIL': return 'Supplier Profile';
        case 'ADD_STOCK': return 'New Stock Item';
        case 'ADD_SUPPLIER': return 'Register Supplier';
        case 'ORDER_FORM': return 'New Order';
        case 'EDIT_PROFILE': return 'Edit Profile';
        case 'CHANGE_PASSWORD': return 'Change Password';
        default: return 'Details';
    }
  };

  const getDrawerSubtitle = () => {
     if (selectedItem && selectedItem.name) return selectedItem.name;
     if (drawerType === 'ADD_STOCK') return 'Add a new product to inventory';
     if (drawerType === 'ADD_SUPPLIER') return 'Create a new partnership';
     if (drawerType === 'EDIT_PROFILE') return 'Update your personal information';
     if (drawerType === 'CHANGE_PASSWORD') return 'Secure your account';
     return '';
  };

  // Drawer Footer Logic
  const getDrawerFooter = () => {
    if (drawerType === 'ADD_STOCK') {
        return (
            <button 
                type="submit"
                form="add-stock-form"
                className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
                Create Item
            </button>
        );
    }
    if (drawerType === 'ADD_SUPPLIER') {
        return (
            <button 
                type="submit"
                form="add-supplier-form"
                className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
                Register Supplier
            </button>
        );
    }
     if (drawerType === 'ORDER_FORM') {
        return (
            <button 
                type="submit"
                form="order-form"
                className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
                Send Request
            </button>
        );
    }
    if (drawerType === 'EDIT_PROFILE') {
        return (
            <button 
                type="submit"
                form="edit-profile-form"
                className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
                Save Changes
            </button>
        );
    }
     if (drawerType === 'CHANGE_PASSWORD') {
        return (
            <button 
                type="submit"
                form="change-password-form"
                className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
                Update Password
            </button>
        );
    }
    if (drawerType === 'STOCK_DETAIL') {
        return (
             <button className="bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                 Update Stock
             </button>
        );
    }
    if (drawerType === 'SUPPLIER_DETAIL') {
         return (
             <button 
                onClick={() => {
                    closeDrawer();
                    setTimeout(() => openOrderForm(selectedItem), 300);
                }}
                className="bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
             >
                 Create New Order
             </button>
         );
    }
    return null;
  }

  // Auth Flow
  if (!isLoggedIn) {
      return (
        <>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <LoginView onLogin={handleLogin} />
        </>
      );
  }

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 md:ml-20 lg:ml-64">
        <Header onChangeView={setView} onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            {view === 'DASHBOARD' && (
                <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                        <div>
                             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
                             <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back, Prince Neza</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => handleDateFilter(dateRange === 'This Month' ? 'Last 3 Months' : 'This Month')}
                                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>{dateRange}</span>
                            </button>
                            
                            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                                <button 
                                    onClick={openAddStock}
                                    className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all whitespace-nowrap active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>New Entry</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <DashboardStats onNavigate={setView} />

                    <DashboardCharts />

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        <div className="xl:col-span-3 overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-1">
                             <div className="flex justify-between items-center p-5 border-b border-slate-50">
                                <h3 className="font-bold text-slate-800">Recent Inventory</h3>
                                <button 
                                    onClick={() => setView('TRANSACTIONS')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                    View All
                                </button>
                             </div>
                             <div className="p-2">
                                {reportsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                    </div>
                                ) : reportsError ? (
                                    <div className="p-4 text-center text-red-600 text-sm">
                                        Error loading dashboard data
                                    </div>
                                ) : (
                                    <DashboardTable items={dashboardItems.slice(0, 6)} />
                                )}
                             </div>
                        </div>
                        <div className="xl:col-span-1">
                             <RecentActivity />
                        </div>
                    </div>
                </div>
            )}

            {view === 'STOCK' && (
                <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                         <div>
                             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Stock Management</h1>
                             <p className="text-sm text-slate-500 mt-1 font-medium">Manage and track your inventory items</p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => handleExport('CSV')}
                                className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                <span>Export CSV</span>
                                <FileSpreadsheet className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={openAddStock}
                                className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                            >
                                <span>Add Item</span>
                                <PlusCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <div className="px-3 py-2 border-r border-slate-100 flex items-center gap-2 text-slate-500">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Category</button>
                        <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Status</button>
                        <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Stock Level</button>
                        <div className="flex-1"></div>
                        <button className="p-2 text-slate-400 hover:text-slate-600">
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {itemsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            <span className="ml-3 text-slate-600">Loading items...</span>
                        </div>
                    ) : itemsError ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-800 font-medium">Error loading items</p>
                            <p className="text-red-600 text-sm mt-1">{itemsError.message}</p>
                            <button 
                                onClick={() => refetchItems()}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : stockItems.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
                            <Box className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                            <p className="text-slate-600 font-medium">No items found</p>
                            <p className="text-slate-500 text-sm mt-1">Add your first item to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {stockItems.map((item) => (
                                <StockCard 
                                    key={item.id} 
                                    item={item} 
                                    onManage={openStockDetail}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {view === 'TRANSACTIONS' && (
                 <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Transactions</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Complete history of stock movements</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium">
                                <Calendar className="w-4 h-4" />
                                <span>This Month</span>
                            </button>
                             <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium">
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>All Filters</span>
                            </button>
                        </div>

                        {transactionsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                                <span className="ml-3 text-slate-600">Loading transactions...</span>
                            </div>
                        ) : transactionsError ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                <p className="text-red-800 font-medium">Error loading transactions</p>
                                <p className="text-red-600 text-sm mt-1">{transactionsError.message}</p>
                                <button 
                                    onClick={() => refetchTransactions()}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No transactions found</p>
                                <p className="text-sm mt-1">Transactions will appear here once you start recording stock movements</p>
                            </div>
                        ) : (
                            <TransactionsTable items={dashboardItems} />
                        )}
                        
                         <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-slate-500 gap-4 pt-4 border-t border-slate-50">
                                 <div>Displaying <span className="font-semibold text-slate-700">{Math.min(dashboardItems.length, 14)}</span> of <span className="font-semibold text-slate-700">{dashboardItems.length}</span> transactions</div>
                                 <div className="flex items-center gap-2">
                                     <button className="flex items-center gap-1 bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 text-slate-600 transition-colors">
                                         <ChevronLeft className="w-3 h-3" />
                                         <span>Previous</span>
                                     </button>
                                     <div className="flex gap-1">
                                         <button className="w-8 h-8 flex items-center justify-center bg-[#1e293b] text-white rounded-lg text-xs font-medium">1</button>
                                         <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-600">2</button>
                                         <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-600">3</button>
                                     </div>
                                      <button className="flex items-center gap-1 bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 text-slate-600 transition-colors">
                                         <span>Next</span>
                                         <ChevronRight className="w-3 h-3" />
                                     </button>
                                 </div>
                             </div>
                     </div>
                 </div>
            )}

            {view === 'ANALYTICS' && (
                <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
                             <p className="text-sm text-slate-500 mt-1 font-medium">Deep dive into inventory performance</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                                <Calendar className="w-4 h-4" />
                                <span>Last 6 Months</span>
                            </button>
                            <button 
                                onClick={() => handleExport('Analytics')}
                                className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>Export Report</span>
                            </button>
                        </div>
                     </div>

                     <AnalyticsStats />

                     <AnalyticsCharts />

                     <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-blue-50/50 to-indigo-50/50 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    AI Intelligent Insight
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Generate a comprehensive analysis of your current stock health.</p>
                            </div>
                            <button 
                                onClick={handleGenerateReport}
                                disabled={loadingReport}
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                            >
                                {loadingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                <span>{loadingReport ? 'Analyzing...' : 'Generate Analysis'}</span>
                            </button>
                        </div>
                        
                        {aiReport && (
                            <div className="p-8 prose prose-slate max-w-none bg-white">
                                <ReactMarkdown>{aiReport}</ReactMarkdown>
                            </div>
                        )}
                        
                        {!aiReport && !loadingReport && (
                            <div className="p-12 text-center text-slate-400">
                                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20 text-indigo-400" />
                                <p className="font-medium">Click "Generate Analysis" to get AI-powered insights about your inventory.</p>
                            </div>
                        )}
                     </div>
                </div>
            )}

            {view === 'SUPPLIERS' && (
                <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Suppliers</h1>
                             <p className="text-sm text-slate-500 mt-1 font-medium">Manage your partnerships</p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button 
                                onClick={openAddSupplier}
                                className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                            >
                                <span>Add Supplier</span>
                                <PlusCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MOCK_SUPPLIERS.map((supplier, idx) => (
                            <SupplierCard 
                                key={supplier.id + idx} 
                                supplier={supplier} 
                                onViewDetails={openSupplierDetail}
                                onOrder={openOrderForm}
                            />
                        ))}
                    </div>
                </div>
            )}

            {view === 'REPORT' && <ReportsView onGenerateReport={() => addToast('Generate Report feature is coming soon!', 'info')} />}
            {view === 'SETTINGS' && <SettingsView />}
            {view === 'NOTIFICATIONS' && <NotificationsView />}
            {view === 'PROFILE' && <ProfileView onEditProfile={openEditProfile} onChangePassword={openChangePassword} onLogout={handleLogout} />}

            {view !== 'DASHBOARD' && view !== 'STOCK' && view !== 'TRANSACTIONS' && view !== 'ANALYTICS' && view !== 'SUPPLIERS' && view !== 'REPORT' && view !== 'SETTINGS' && view !== 'NOTIFICATIONS' && view !== 'PROFILE' && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <p className="text-lg font-medium">Page under construction</p>
                    <p className="text-sm">Select a valid page from the sidebar.</p>
                </div>
            )}
        </main>
      </div>

      {/* Detail Drawer */}
      <DetailDrawer 
        isOpen={drawerOpen}
        onClose={closeDrawer}
        title={getDrawerTitle()}
        subtitle={getDrawerSubtitle()}
        footer={getDrawerFooter()}
      >
        {renderDrawerContent()}
      </DetailDrawer>

    </div>
  );
};

export default App;