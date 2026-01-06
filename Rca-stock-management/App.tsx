import React, { useState, useEffect } from 'react';
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
import { useItems } from './hooks/useItems';
import { useReports } from './hooks/useReports';
import { useTransactions } from './hooks/useTransactions';
import { useSuppliers } from './hooks/useSuppliers';
import { CreateItemRequest, CreateTransactionRequest, UpdateItemRequest } from './api/types';
import { ApiError } from './api/client';
import { updateProfile, changePassword, UpdateProfileRequest, ChangePasswordRequest } from './api/services/userService';
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
  Briefcase,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  LayoutGrid
} from 'lucide-react';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [view, setView] = useState<ViewState>('DASHBOARD');
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dateRange, setDateRange] = useState('This Month');

  // API Hooks
  const { items: stockItems, loading: itemsLoading, error: itemsError, addItem, updateItem, deleteItem, refetch: refetchItems } = useItems();
  const { dashboardItems, loading: reportsLoading, error: reportsError, balanceReport, refetch: refetchReports } = useReports();
  const { transactions, loading: transactionsLoading, error: transactionsError, addTransaction, refetch: refetchTransactions } = useTransactions();
  const { suppliers, loading: suppliersLoading, error: suppliersError, addSupplier, updateSupplier, deactivateSupplier, refetch: refetchSuppliers } = useSuppliers();

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<DrawerType>('NONE');
  const [selectedItem, setSelectedItem] = useState<StockItem | Supplier | UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // Stock management form state
  const [stockInQuantity, setStockInQuantity] = useState('');
  const [stockOutQuantity, setStockOutQuantity] = useState('');
  const [stockOutReason, setStockOutReason] = useState('Consumed');
  const [damagedQuantity, setDamagedQuantity] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // Filter state for transactions
  const [selectedTransactionItem, setSelectedTransactionItem] = useState<string>('');

  // Stock View State
  const [stockViewMode, setStockViewMode] = useState<'grid' | 'list'>('list');
  const [stockCategoryFilter, setStockCategoryFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');

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
  const handleLogin = (token: string, email: string) => {
      setIsLoggedIn(true);
      setView('DASHBOARD');
      addToast(`Welcome back, ${email}!`, 'success');
  };

  const handleLogout = () => {
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      setIsLoggedIn(false);
      setView('DASHBOARD');
      addToast('Logged out successfully.', 'info');
  };

  // Check if user is already logged in on mount
    useEffect(() => {
            const token = localStorage.getItem('authToken');
            if (token) {
                    setIsLoggedIn(true);
            }
    }, []);

    // Fetch user profile when logged in
    useEffect(() => {
        if (isLoggedIn) {
            import('./api/services/userService').then(({ getProfile }) => {
                getProfile().then(setUserProfile);
            });
            refetchSuppliers();
        }
    }, [isLoggedIn]);

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

  const handleExport = async (type: string) => {
    const id = addToast(`Generating ${type} export...`, 'loading');
    try {
        // Use the report service to generate a comprehensive CSV
        await import('./api/services/reportService').then(({ generateCsvReport }) => 
            generateCsvReport('balance') // Default to balance report for stock view
        );
        removeToast(id);
        addToast(`${type} file downloaded successfully.`, 'success');
    } catch (error) {
        removeToast(id);
        addToast('Failed to generate export.', 'error');
    }
  };

  const handleDateFilter = (range: string) => {
    setDateRange(range);
    addToast(`Filter updated: ${range}`, 'success');
  };

  const handleStockIn = async () => {
    if (!selectedItem || !stockInQuantity || !('currentQuantity' in selectedItem)) return;
    const quantity = parseInt(stockInQuantity);
    if (quantity <= 0) {
      addToast('Please enter a valid quantity.', 'error');
      return;
    }

    const transactionData: CreateTransactionRequest = {
      itemId: Number(selectedItem.id),
      transactionType: 'IN',
      quantity,
      transactionDate,
      notes,
      recordedBy: userProfile?.name || 'User',
      supplierId: selectedSupplierId ? Number(selectedSupplierId) : undefined
    };

    try {
      const toastId = addToast('Recording stock in...', 'loading');
      await addTransaction(transactionData);
      removeToast(toastId);
      addToast('Stock in recorded successfully.', 'success');
      closeDrawer();
      await Promise.all([refetchItems(), refetchReports(), refetchTransactions()]);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to record stock in.';
      addToast(errorMessage, 'error');
    }
  };

  const handleStockOut = async () => {
    if (!selectedItem || !stockOutQuantity || !('currentQuantity' in selectedItem)) return;
    const quantity = parseInt(stockOutQuantity);
    if (quantity <= 0) {
      addToast('Please enter a valid quantity.', 'error');
      return;
    }

    if (quantity > selectedItem.currentQuantity) {
        addToast('Stock out quantity cannot be greater than current stock.', 'error');
        return;
    }

    const transactionData: CreateTransactionRequest = {
      itemId: Number(selectedItem.id),
      transactionType: 'OUT',
      quantity,
      transactionDate,
      notes: `${stockOutReason}: ${notes}`,
      recordedBy: userProfile?.name || 'User',
    };

    try {
      const toastId = addToast('Recording stock out...', 'loading');
      await addTransaction(transactionData);
      removeToast(toastId);
      addToast('Stock out recorded successfully.', 'success');
      closeDrawer();
      await Promise.all([refetchItems(), refetchReports(), refetchTransactions()]);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to record stock out.';
      addToast(errorMessage, 'error');
    }
  };

  const handleReportDamaged = async () => {
    if (!selectedItem || !damagedQuantity || !('currentQuantity' in selectedItem)) return;
    const quantity = parseInt(damagedQuantity);
    if (quantity <= 0) {
      addToast('Please enter a valid quantity.', 'error');
      return;
    }

    try {
      const toastId = addToast('Reporting damaged stock...', 'loading');
      // This function needs to be created in itemService.ts
      await import('./api/services/itemService').then(({ recordDamagedQuantity }) => 
        recordDamagedQuantity(Number(selectedItem.id), quantity)
      );
      removeToast(toastId);
      addToast('Damaged stock reported successfully.', 'success');
      closeDrawer();
      await Promise.all([refetchItems(), refetchReports()]);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to report damaged stock.';
      addToast(errorMessage, 'error');
    }
  };

  // Drawer Openers
  const openStockDetail = (item: StockItem) => {
    setSelectedItem(item);
    setDrawerType('STOCK_DETAIL');
    setDrawerOpen(true);
    setActiveTab('details');
    setStockInQuantity('');
    setStockOutQuantity('');
    setDamagedQuantity('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const openAddStock = () => {
    setSelectedItem(null);
    setDrawerType('ADD_STOCK');
    setDrawerOpen(true);
  };

  const openDeleteItem = (item: StockItem) => {
    setSelectedItem(item);
    setDrawerType('DELETE_ITEM');
    setDrawerOpen(true);
    setDeleteConfirmation('');
    setDeletePassword('');
  };

  const openTransactionDrawer = (type: 'IN' | 'OUT') => {
    setDrawerType(type === 'IN' ? 'STOCK_IN' : 'STOCK_OUT');
    setDrawerOpen(true);
    setSelectedItem(null);
    setStockInQuantity('');
    setStockOutQuantity('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setStockOutReason('Consumed');
    setSelectedSupplierId('');
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

  const openAddSupplier = () => {
    setSelectedItem(null);
    setDrawerType('ADD_SUPPLIER');
    setDrawerOpen(true);
  };

  const openEditProfile = () => {
      if (userProfile) {
        setSelectedItem(userProfile);
        setDrawerType('EDIT_PROFILE');
        setDrawerOpen(true);
      }
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

  // Filtered Items Logic
  const filteredStockItems = stockItems.filter(item => {
      const matchesCategory = stockCategoryFilter ? item.category === stockCategoryFilter : true;
      const matchesStatus = stockStatusFilter ? item.status === stockStatusFilter : true;
      
      return matchesCategory && matchesStatus;
  });

  // Unique categories for filter dropdown
  const categories = Array.from(new Set(stockItems.map(item => item.category)));

  // Drawer Content Renders
  const renderDrawerContent = () => {
    if (drawerType === 'STOCK_IN' || drawerType === 'STOCK_OUT') {
        const isStockIn = drawerType === 'STOCK_IN';
        return (
            <form id="transaction-form" className="space-y-5" onSubmit={(e) => {
                e.preventDefault();
                if (isStockIn) {
                    // Simplified handleStockIn logic
                    const selectedItemId = (document.getElementById('item-select') as HTMLSelectElement).value;
                    const item = stockItems.find(i => i.id === selectedItemId);
                    if (!item) {
                        addToast('Please select an item.', 'error');
                        return;
                    }
                    setSelectedItem(item); // Temporarily set for handler
                    setTimeout(() => handleStockIn(), 0);
                } else {
                    // Simplified handleStockOut logic
                    const selectedItemId = (document.getElementById('item-select') as HTMLSelectElement).value;
                    const item = stockItems.find(i => i.id === selectedItemId);
                    if (!item) {
                        addToast('Please select an item.', 'error');
                        return;
                    }
                    setSelectedItem(item); // Temporarily set for handler
                    setTimeout(() => handleStockOut(), 0);
                }
            }}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Item</label>
                    <select id="item-select" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required>
                        <option value="">Choose an item...</option>
                        {stockItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity</label>
                    <input value={isStockIn ? stockInQuantity : stockOutQuantity} onChange={(e) => isStockIn ? setStockInQuantity(e.target.value) : setStockOutQuantity(e.target.value)} type="number" min="1" placeholder="Enter quantity" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                {isStockIn && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier (Optional)</label>
                        <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option value="">Select Supplier...</option>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                {!isStockIn && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Stock Out</label>
                        <select value={stockOutReason} onChange={(e) => setStockOutReason(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required>
                            <option>Consumed</option>
                            <option>Damaged</option>
                            <option>Expired</option>
                            <option>Transferred</option>
                            <option>Other</option>
                        </select>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Transaction Date</label>
                    <input value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (Optional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any relevant details" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-24"></textarea>
                </div>
            </form>
        );
    }

    if (drawerType === 'STOCK_DETAIL' && selectedItem) {
        const item = selectedItem as StockItem;
        const TabButton = ({ tabName, label }: { tabName: string; label: string }) => (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tabName
                        ? 'bg-white border-slate-200 border-t border-x text-slate-800'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
            >
                {label}
            </button>
        );

        return (
            <div className="space-y-6">
                <div className="flex border-b border-slate-200 -mx-6 px-6">
                    <TabButton tabName="details" label="Details" />
                    <TabButton tabName="edit" label="Edit Item" />
                </div>

                {activeTab === 'details' && (
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
                )}

                {activeTab === 'edit' && (
                    <form id="edit-stock-form" className="space-y-5" onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        
                        const updateData: UpdateItemRequest = {
                            name: formData.get('name') as string,
                            unit: formData.get('unit') as string,
                            minimumStock: parseInt(formData.get('minimumStock') as string),
                            description: formData.get('description') as string,
                        };

                        try {
                            const toastId = addToast("Updating item...", 'loading');
                            await updateItem(Number(item.id), updateData);
                            removeToast(toastId);
                            addToast("Item updated successfully.", 'success');
                            closeDrawer();
                            await refetchItems();
                        } catch (error) {
                            const errorMessage = error instanceof ApiError ? error.message : 'Failed to update item.';
                            addToast(errorMessage, 'error');
                        }
                    }}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name</label>
                            <input name="name" defaultValue={item.name} type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description / Category</label>
                            <input name="description" defaultValue={item.category} type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
                                <select name="unit" defaultValue={item.unit} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required>
                                    <option>Kg</option>
                                    <option>Liters</option>
                                    <option>Pieces</option>
                                    <option>Bags</option>
                                    <option>Sacks</option>
                                    <option>Boxes</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Threshold</label>
                                <input name="minimumStock" defaultValue={item.minimumQuantity} type="number" min="1" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    }

    if (drawerType === 'DELETE_ITEM' && selectedItem) {
        const item = selectedItem as StockItem;
        return (
            <div className="space-y-6">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-bold text-red-800">Warning: Irreversible Action</h3>
                        <p className="text-xs text-red-600 mt-1">
                            Deleting <strong>{item.name}</strong> will remove all associated data, including transaction history. This cannot be undone.
                        </p>
                    </div>
                </div>

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (deleteConfirmation !== 'i confirm delete') {
                        addToast('Please type the confirmation phrase exactly.', 'error');
                        return;
                    }
                    
                    if (!deletePassword) {
                        addToast('Please enter your password.', 'error');
                        return;
                    }
                    
                    try {
                        const toastId = addToast("Deleting item...", 'loading');
                        // Pass password to deleteItem
                        await deleteItem(Number(item.id), deletePassword);
                        removeToast(toastId);
                        addToast("Item deleted successfully.", 'success');
                        closeDrawer();
                        await Promise.all([refetchItems(), refetchReports(), refetchTransactions()]);
                    } catch (error) {
                        const errorMessage = error instanceof ApiError ? error.message : 'Failed to delete item. Incorrect password?';
                        addToast(errorMessage, 'error');
                    }
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Type <span className="font-mono font-bold text-red-600">i confirm delete</span> to confirm
                        </label>
                        <input 
                            type="text" 
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            placeholder="i confirm delete"
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin Password</label>
                        <input 
                            type="password" 
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            placeholder="Enter your password"
                            required 
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button" 
                            onClick={closeDrawer}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={deleteConfirmation !== 'i confirm delete' || !deletePassword}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Delete Item
                        </button>
                    </div>
                </form>
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
                            itemId: Number(newItem.id),
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
                    // Refresh all data
                    await Promise.all([
                        refetchItems(),
                        refetchReports(),
                        refetchTransactions()
                    ]);
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
            <form id="add-supplier-form" className="space-y-5" onSubmit={async (e) => { 
                e.preventDefault(); 
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                
                const supplierData = {
                    name: formData.get('name') as string,
                    contact: formData.get('phone') as string, // Mapping phone to contact for now
                    email: formData.get('email') as string,
                    itemsSupplied: (formData.get('itemsSupplied') as string).split(',').map(s => s.trim()),
                };

                try {
                    const toastId = addToast("Adding supplier...", 'loading');
                    await addSupplier(supplierData);
                    removeToast(toastId);
                    addToast("Supplier added successfully.", 'success');
                    closeDrawer();
                    refetchSuppliers(); // Refresh list
                } catch (error) {
                    const errorMessage = error instanceof ApiError 
                        ? error.message 
                        : 'Failed to add supplier. Please try again.';
                    addToast(errorMessage, 'error');
                }
            }}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                    <input name="name" type="text" placeholder="e.g. Kigali Grains Ltd" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Person</label>
                    <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input name="contactPerson" type="text" placeholder="Full Name" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input name="phone" type="tel" placeholder="+250 7..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input name="email" type="email" placeholder="contact@supplier.com" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Items Supplied</label>
                    <textarea name="itemsSupplied" placeholder="List main items supplied (comma separated)..." className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-24"></textarea>
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
                
                <div className="pt-4 border-t border-slate-100">
                    <button 
                        onClick={async () => {
                            if (confirm('Are you sure you want to deactivate this supplier?')) {
                                try {
                                    const toastId = addToast("Deactivating supplier...", 'loading');
                                    await deactivateSupplier(supplier.id);
                                    removeToast(toastId);
                                    addToast("Supplier deactivated.", 'success');
                                    closeDrawer();
                                    refetchSuppliers();
                                } catch (e) {
                                    addToast("Failed to deactivate supplier.", 'error');
                                }
                            }
                        }}
                        className="w-full text-center text-rose-600 text-sm font-medium hover:text-rose-700"
                    >
                        Deactivate Supplier
                    </button>
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
             <form id="edit-profile-form" className="space-y-5" onSubmit={async (e) => { 
                e.preventDefault(); 
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const profileData: UpdateProfileRequest = {
                    name: formData.get('name') as string || undefined,
                    email: formData.get('email') as string || undefined,
                    phone: formData.get('phone') as string || undefined,
                    department: formData.get('department') as string || undefined,
                };
                try {
                    const toastId = addToast("Updating profile...", 'loading');
                    await updateProfile(profileData);
                    removeToast(toastId);
                    addToast("Profile updated successfully", 'success');
                    // Refetch profile and update state
                    import('./api/services/userService').then(({ getProfile }) => {
                      getProfile().then((data) => {
                        setUserProfile(data);
                        closeDrawer();
                      });
                    });
                } catch (error) {
                    const errorMessage = error instanceof ApiError 
                        ? error.data?.message || error.message 
                        : 'Failed to update profile. Please try again.';
                    addToast(errorMessage, 'error');
                }
            }}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input name="name" type="text" defaultValue={profile.name} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                         <input type="text" defaultValue={profile.role} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50" readOnly />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                         <input name="department" type="text" defaultValue={profile.department} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                     <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input name="email" type="email" defaultValue={profile.email} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input name="phone" type="tel" defaultValue={profile.phone} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                </div>
            </form>
        );
    }

    if (drawerType === 'CHANGE_PASSWORD') {
        return (
             <form id="change-password-form" className="space-y-5" onSubmit={async (e) => { 
                e.preventDefault(); 
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                
                const currentPassword = formData.get('currentPassword') as string;
                const newPassword = formData.get('newPassword') as string;
                const confirmPassword = formData.get('confirmPassword') as string;

                // Validate passwords match
                if (newPassword !== confirmPassword) {
                    addToast("New password and confirm password do not match", 'error');
                    return;
                }

                // Validate password length
                if (newPassword.length < 8) {
                    addToast("New password must be at least 8 characters long", 'error');
                    return;
                }

                const passwordData: ChangePasswordRequest = {
                    currentPassword,
                    newPassword,
                    confirmPassword,
                };

                try {
                    const toastId = addToast("Changing password...", 'loading');
                    await changePassword(passwordData);
                    removeToast(toastId);
                    addToast("Password changed successfully", 'success');
                    closeDrawer();
                    // Optionally logout user after password change
                    setTimeout(() => {
                        handleLogout();
                    }, 1500);
                } catch (error) {
                    const errorMessage = error instanceof ApiError 
                        ? error.data?.message || error.message 
                        : 'Failed to change password. Please try again.';
                    addToast(errorMessage, 'error');
                }
            }}>
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600">
                    <p>Make sure your new password is at least 8 characters long and includes a number.</p>
                 </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                    <input name="currentPassword" type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                    <input name="newPassword" type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required minLength={8} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                    <input name="confirmPassword" type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required minLength={8} />
                </div>
            </form>
        );
    }

    return <div className="text-slate-400 text-center py-10">Select an item to view details</div>;
  };

  const getDrawerTitle = () => {
    switch(drawerType) {
        case 'STOCK_IN': return 'Record Stock In';
        case 'STOCK_OUT': return 'Record Stock Out';
        case 'STOCK_DETAIL': return 'Item Details';
        case 'DELETE_ITEM': return 'Delete Item';
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
     if (drawerType === 'STOCK_IN') return 'Add new inventory to the stock';
     if (drawerType === 'STOCK_OUT') return 'Remove inventory from the stock';
     if (drawerType === 'DELETE_ITEM') return 'Permanently remove this item';
     return '';
  };

  // Drawer Footer Logic
  const getDrawerFooter = () => {
    if (drawerType === 'STOCK_IN' || drawerType === 'STOCK_OUT') {
        return (
            <button 
                type="submit"
                form="transaction-form"
                className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
                {drawerType === 'STOCK_IN' ? 'Record Stock In' : 'Record Stock Out'}
            </button>
        );
    }
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
            <LoginView onLogin={(token, email) => handleLogin(token, email)} />
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
                        
                        {/* Search Input - Removed as requested, relying on main header search if implemented or just filters */}
                        {/* If main header search is not wired to stockSearch state, we might need to keep this or wire header search */}
                        {/* Assuming main header search is global or we just use filters for now as per request to remove "extra" search */}
                        
                        {/* Category Filter */}
                        <select 
                            value={stockCategoryFilter}
                            onChange={(e) => setStockCategoryFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors border-none outline-none cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>

                        {/* Status Filter */}
                        <select 
                            value={stockStatusFilter}
                            onChange={(e) => setStockStatusFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors border-none outline-none cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="Birahagije">Birahagije</option>
                            <option value="Mucye">Mucye</option>
                            <option value="Byashize">Byashize</option>
                        </select>

                        <div className="flex-1"></div>
                        
                        {/* View Toggle */}
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button 
                                onClick={() => setStockViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${stockViewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setStockViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${stockViewMode === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
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
                    ) : filteredStockItems.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
                            <Box className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                            <p className="text-slate-600 font-medium">No items found</p>
                            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or add a new item</p>
                        </div>
                    ) : (
                        stockViewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredStockItems.map((item) => (
                                    <StockCard 
                                        key={item.id} 
                                        item={item} 
                                        onManage={openStockDetail}
                                        onDelete={openDeleteItem}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Item Name</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4 text-center">Unit</th>
                                            <th className="px-6 py-4 text-right">Current Stock</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredStockItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                                                <td className="px-6 py-4 text-slate-500">{item.category}</td>
                                                <td className="px-6 py-4 text-center text-slate-500">{item.unit}</td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-700">{item.currentQuantity}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                        item.status === 'Birahagije' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        item.status === 'Mucye' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-rose-50 text-rose-700 border-rose-100'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => openStockDetail(item)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-xs mr-3"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => openDeleteItem(item)}
                                                        className="text-rose-600 hover:text-rose-800 font-medium text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            )}

            {view === 'TRANSACTIONS' && (
                 <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Transactions</h1>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Complete history of stock movements</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => openTransactionDrawer('IN')}
                                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                <ArrowUp className="w-4 h-4" />
                                <span>Stock In</span>
                            </button>
                            <button
                                onClick={() => openTransactionDrawer('OUT')}
                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                            >
                                <ArrowDown className="w-4 h-4" />
                                <span>Stock Out</span>
                            </button>
                        </div>
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
                            <div className="flex-1"></div>
                            <select 
                                value={selectedTransactionItem}
                                onChange={(e) => {
                                    setSelectedTransactionItem(e.target.value);
                                    // Trigger refetch with new item ID
                                    // Note: In a real app, we might want to debounce this or use a separate effect
                                    // For now, we'll rely on the parent component to handle this if needed, 
                                    // but useTransactions hook exposes refetch which we can use.
                                    // However, useTransactions doesn't take arguments in its current form in App.tsx
                                    // We need to update how we call useTransactions or filter locally.
                                    // Given the current setup, we'll filter locally in the render or update the hook.
                                    // Let's update the hook call in the component body to depend on this state.
                                }}
                                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium"
                            >
                                <option value="">All Items</option>
                                {stockItems.map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
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
                            <TransactionsTable 
                                items={selectedTransactionItem 
                                    ? transactions.filter(t => t.itemId.toString() === selectedTransactionItem)
                                    : transactions
                                } 
                                showBalance={!!selectedTransactionItem} // Only show balance when filtered by item
                            />
                        )}
                        
                         <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-slate-500 gap-4 pt-4 border-t border-slate-50">
                                 <div>Displaying <span className="font-semibold text-slate-700">{Math.min(transactions.length, 14)}</span> of <span className="font-semibold text-slate-700">{transactions.length}</span> transactions</div>
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
                        {suppliers.map((supplier) => (
                            <SupplierCard 
                                key={supplier.id} 
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
