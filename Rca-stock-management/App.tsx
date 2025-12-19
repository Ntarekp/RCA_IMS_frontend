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
import { MOCK_STOCK_ITEMS, MOCK_DASHBOARD_DATA, MOCK_SUPPLIERS, MOCK_USER_PROFILE } from './constants';
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

    // Dummy AI report generator (Gemini removed)
    const handleGenerateReport = async () => {
        setLoadingReport(true);
        setAiReport(null);
        const id = addToast("Analyzing inventory data...", 'loading');
        try {
            // Simulate analysis delay
            await new Promise((res) => setTimeout(res, 1500));
            const report = `# Inventory Analysis\n\n- Total Items: ${MOCK_STOCK_ITEMS.length}\n- Stock Health: All items are sufficiently stocked.\n- No critical shortages detected.\n\n> This is a sample analysis. AI integration is currently disabled.`;
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
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeDrawer(); addToast("Stock item added successfully."); }}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name</label>
                    <input type="text" placeholder="e.g. Rice (Gikongoro)" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" title="Select category">
                            <option>Grains</option>
                            <option>Vegetables</option>
                            <option>Liquids</option>
                            <option>Spices</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
                        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" title="Select unit">
                            <option>Kg</option>
                            <option>Liters</option>
                            <option>Pieces</option>
                            <option>Bags</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Quantity</label>
                        <input type="number" placeholder="0" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Threshold</label>
                        <input type="number" placeholder="0" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier</label>
                    <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" title="Select supplier">
                        <option value="">Select a supplier...</option>
                        {MOCK_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </form>
        );
    }

    if (drawerType === 'ADD_SUPPLIER') {
        return (
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeDrawer(); addToast("Supplier profile created successfully."); }}>
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
                        <input type="number" placeholder="0" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required title="Initial Quantity" />
                        <span className="text-sm font-medium">{supplier.email}</span>
                    </div>
                     <div className="flex items-center gap-3 text-slate-700">
                        <input type="number" placeholder="0" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required title="Min Threshold" />
                        <span className="text-sm font-medium">Kigali, Nyarugenge District</span>
                    </div>
                </div>
                        <input type="text" placeholder="e.g. Kigali Grains Ltd" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required title="Company Name" />
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
             <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeDrawer(); addToast(`Order request sent to ${selectedItem.name}`); }}>
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
             <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeDrawer(); addToast("Profile updated successfully"); }}>
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
             <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeDrawer(); addToast("Password changed successfully"); }}>
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
                onClick={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
                Create Item
            </button>
        );
    }