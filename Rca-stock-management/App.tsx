import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StockCard } from './components/StockCard';

// Lazy loaded components for performance optimization
const DashboardTable = React.lazy(() => import('./components/DashboardTable').then(module => ({ default: module.DashboardTable })));
const TransactionsTable = React.lazy(() => import('./components/TransactionsTable').then(module => ({ default: module.TransactionsTable })));
const DashboardStats = React.lazy(() => import('./components/DashboardStats').then(module => ({ default: module.DashboardStats })));
const DashboardCharts = React.lazy(() => import('./components/DashboardCharts').then(module => ({ default: module.DashboardCharts })));
const AnalyticsStats = React.lazy(() => import('./components/AnalyticsStats').then(module => ({ default: module.AnalyticsStats })));
const AnalyticsCharts = React.lazy(() => import('./components/AnalyticsCharts').then(module => ({ default: module.AnalyticsCharts })));
const RecentActivity = React.lazy(() => import('./components/RecentActivity').then(module => ({ default: module.RecentActivity })));
const SupplierCard = React.lazy(() => import('./components/SupplierCard').then(module => ({ default: module.SupplierCard })));
const SettingsView = React.lazy(() => import('./components/SettingsView').then(module => ({ default: module.SettingsView })));
const NotificationsView = React.lazy(() => import('./components/NotificationsView').then(module => ({ default: module.NotificationsView })));
const ProfileView = React.lazy(() => import('./components/ProfileView').then(module => ({ default: module.ProfileView })));
const ReportsView = React.lazy(() => import('./components/ReportsView').then(module => ({ default: module.ReportsView })));
const UsersView = React.lazy(() => import('./components/UsersView').then(module => ({ default: module.UsersView })));

import { DetailDrawer } from './components/DetailDrawer';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ToastMessage } from './components/Toast';
import { LoginView } from './components/LoginView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResetPasswordView } from './components/ResetPasswordView';
import { ViewState, DrawerType, StockItem, Supplier, UserProfile } from './types';
import { useItems } from './hooks/useItems';
import { useReportContext } from './context/ReportContext';
import { useToast } from './context/ToastContext';
import { useTransactions } from './hooks/useTransactions';
import { useSuppliers } from './hooks/useSuppliers';
import { CreateItemRequest, CreateTransactionRequest, UpdateItemRequest, StockTransactionDTO, CreateSupplierRequest } from './api/types';
import { ApiError } from './api/client';
import { updateProfile, changePassword, UpdateProfileRequest, ChangePasswordRequest, createUser, CreateUserRequest } from './api/services/userService';
import { getAnalyticsSummary } from './api/services/analyticsService';
import { 
  Calendar, 
  List, 
  FileSpreadsheet, 
  PlusCircle, 
  Plus, 
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
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  LayoutGrid,
  Trash2,
  RefreshCw
} from 'lucide-react';

import { StockInForm } from './components/StockInForm';
import { StockOutForm } from './components/StockOutForm';
import { SupplierDetail } from './components/SupplierDetail';
import { EditTransactionForm } from './components/EditTransactionForm';
import { ReverseTransactionForm } from './components/ReverseTransactionForm';
import { StockDetail } from './components/StockDetail';
import { DeleteItemForm } from './components/DeleteItemForm';
import { DeactivateSupplierForm } from './components/DeactivateSupplierForm';
import { DeleteSupplierForm } from './components/DeleteSupplierForm';
import { AddStockForm } from './components/AddStockForm';
import { AddSupplierForm } from './components/AddSupplierForm';
import { OrderForm } from './components/OrderForm';
import { EditProfileForm } from './components/EditProfileForm';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { AddUserForm } from './components/AddUserForm';

const TabButton = React.memo(({ tabName, label, activeTab, onClick }: { tabName: string; label: string; activeTab: string; onClick: (tab: string) => void }) => (
  <button
    onClick={() => onClick(tabName)}
    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      activeTab === tabName
        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 border-t border-x text-slate-800 dark:text-white'
        : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
    }`}
  >
    {label}
  </button>
));

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [view, setView] = useState<ViewState>('DASHBOARD');
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState('This Month');

  // Check for reset password route
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
      // Check if we are on the reset-password path
      const path = window.location.pathname;
      if (path.endsWith('/reset-password')) {
          const params = new URLSearchParams(window.location.search);
          const token = params.get('token');
          if (token) {
              setResetToken(token);
          }
      }
  }, []);

  // API Hooks
  const { items: stockItems, loading: itemsLoading, error: itemsError, addItem, updateItem, deleteItem, refetch: refetchItems } = useItems();
  const { dashboardItems, loading: reportsLoading, error: reportsError, balanceReport, refreshHistory: refetchReports } = useReportContext();
  const { transactions, loading: transactionsLoading, error: transactionsError, addTransaction, updateTransaction, reverseTransaction, undoReverseTransaction, refetch: refetchTransactions } = useTransactions();
  const { suppliers, inactiveSuppliers, loading: suppliersLoading, error: suppliersError, addSupplier, updateSupplier, deactivateSupplier, reactivateSupplier, hardDeleteSupplier, refetch: refetchSuppliers } = useSuppliers();

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<DrawerType>('NONE');
  const [selectedItem, setSelectedItem] = useState<StockItem | Supplier | UserProfile | StockTransactionDTO | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [usersRefreshTrigger, setUsersRefreshTrigger] = useState(0);

  // Filter state for transactions
  const [selectedTransactionItem, setSelectedTransactionItem] = useState<string>('');
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentTransactionPage(1);
  }, [selectedTransactionItem]);



  // Derived state for pagination
  const filteredTransactions = React.useMemo(() => selectedTransactionItem 
      ? transactions.filter(t => t.itemId.toString() === selectedTransactionItem)
      : transactions, [selectedTransactionItem, transactions]);
  
  const { totalPages, currentTransactions } = React.useMemo(() => {
    const total = Math.ceil(filteredTransactions.length / itemsPerPage);
    const start = (currentTransactionPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredTransactions.length);
    const current = filteredTransactions.slice(start, end);
    return { totalPages: total, currentTransactions: current };
  }, [filteredTransactions, itemsPerPage, currentTransactionPage]);

  // Stock View State
  const [stockViewMode, setStockViewMode] = useState<'grid' | 'list'>('list');
  const [stockCategoryFilter, setStockCategoryFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [stockCurrentPage, setStockCurrentPage] = useState(1);
  const [stockItemsPerPage] = useState(12);

  // Reset pagination when filters change
  useEffect(() => {
    setStockCurrentPage(1);
  }, [stockCategoryFilter, stockStatusFilter]);

  // Supplier View State
  const [showInactiveSuppliers, setShowInactiveSuppliers] = useState(false);

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDangerous?: boolean;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Toast Helpers
  const { addToast, removeToast } = useToast();

  // Logic Handlers
  const handleLogin = useCallback((token: string, email: string) => {
      setIsLoggedIn(true);
      setView('DASHBOARD');
      addToast(`Welcome back, ${email}!`, 'success');
  }, [addToast]);

  const handleLogout = useCallback(() => {
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      setIsLoggedIn(false);
      setView('DASHBOARD');
      addToast('Logged out successfully.', 'info');
      
      // Redirect to base path if we were on a special route like reset-password
      if (window.location.pathname.endsWith('/reset-password')) {
          // Navigate to base URL (e.g., /rca_ims/)
          const basePath = import.meta.env.BASE_URL;
          window.history.pushState({}, '', basePath);
      }
  }, [addToast]);

  // Check if user is already logged in on mount
    useEffect(() => {
            const token = localStorage.getItem('authToken');
            if (token) {
                    setIsLoggedIn(true);
            }

            // Listen for auth errors (401) from API client
            const handleAuthError = () => {
                // Clear local storage and reset state
                localStorage.removeItem('authToken');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                setIsLoggedIn(false);
                setView('DASHBOARD');
                // We don't use handleLogout() directly here to avoid dependency cycle issues
                // and to ensure this effect only runs once on mount
            };

            window.addEventListener('auth-error', handleAuthError);
            return () => window.removeEventListener('auth-error', handleAuthError);
    }, []);

    // Fetch user profile when logged in
    useEffect(() => {
        if (isLoggedIn) {
            import('./api/services/userService').then(({ getProfile }) => {
                getProfile().then((profile) => {
                    setUserProfile(profile);
                    // Apply theme from profile
                    if (profile.theme === 'DARK') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }).catch(error => {
                    if (import.meta.env.DEV) console.error("Failed to fetch profile:", error);
                    // Only logout on authentication errors (401/403)
                    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                        handleLogout();
                    } else {
                        // For other errors (network, server), just show a toast
                        addToast("Connection issue: Failed to load profile. Some features may be limited.", 'warning');
                    }
                });
            });
            refetchSuppliers();
        }
    }, [isLoggedIn]);

    // AI report generator using real data
    const handleGenerateReport = useCallback(async () => {
        setLoadingReport(true);
        setAiReport(null);
        const id = addToast("Analyzing inventory data...", 'loading');
        try {
            // Fetch real analytics data
            const analytics = await getAnalyticsSummary();
            
            const totalItems = stockItems.length;
            const lowStockCount = balanceReport.filter(item => item.isLowStock).length;
            const criticalCount = balanceReport.filter(item => item.status === 'CRITICAL').length;
            
            // Generate insights based on real data
            let insights = "";
            if (analytics.wastageRatio > 5) {
                insights += `- **High Wastage**: Your wastage ratio is ${analytics.wastageRatio}%, which is above the recommended 5%. Check for expired items.\n`;
            }
            if (analytics.consumptionRate > 100) {
                insights += `- **High Consumption**: You are consuming items rapidly (${analytics.consumptionRate}/mo). Ensure restock frequency matches demand.\n`;
            }
            
            const report = `# Inventory Analysis\n\n## Summary\n- **Total Items**: ${totalItems}\n- **Consumption Rate**: ${analytics.consumptionRate} units/mo\n- **Wastage Ratio**: ${analytics.wastageRatio}%\n- **Restock Frequency**: Every ${analytics.restockFrequency} days\n\n## Stock Health\n${criticalCount > 0 ? `⚠️ **CRITICAL**: ${criticalCount} item(s) are out of stock.\n` : ''}${lowStockCount > 0 ? `⚠️ **LOW STOCK**: ${lowStockCount} item(s) are below minimum threshold.\n` : ''}\n## AI Insights\n${insights || '- Operations appear normal based on current data.'}\n\n> Analysis generated from real-time inventory data.`;
            
            setAiReport(report);
            removeToast(id);
            addToast("Analysis generated successfully!", 'success');
        } catch (e) {
            removeToast(id);
            addToast("Failed to generate analysis.", 'error');
        }
        setLoadingReport(false);
    }, [addToast, removeToast, stockItems.length, balanceReport]);

  const handleExport = useCallback(async (type: string) => {
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
  }, [addToast, removeToast]);

  const handleDateFilter = useCallback((range: string) => {
    setDateRange(range);
    addToast(`Filter updated: ${range}`, 'success');
  }, [addToast]);

  // Drawer Openers
  const openStockDetail = useCallback((item: StockItem) => {
    setSelectedItem(item);
    setDrawerType('STOCK_DETAIL');
    setDrawerOpen(true);
  }, []);

  const openDeleteItem = useCallback((item: StockItem) => {
    setSelectedItem(item);
    setDrawerType('DELETE_ITEM');
    setDrawerOpen(true);
  }, []);

  const openTransactionDrawer = useCallback((type: 'IN' | 'OUT') => {
    setDrawerType(type === 'IN' ? 'STOCK_IN' : 'STOCK_OUT');
    setDrawerOpen(true);
    setSelectedItem(null);
  }, []);

  const openEditTransaction = useCallback((transaction: StockTransactionDTO) => {
    setSelectedItem(transaction);
    setDrawerType('EDIT_TRANSACTION');
    setDrawerOpen(true);
  }, []);

  const openReverseTransaction = useCallback((transaction: StockTransactionDTO) => {
    setSelectedItem(transaction);
    setDrawerType('REVERSE_TRANSACTION');
    setDrawerOpen(true);
  }, []);

  const handleUndoReverseTransaction = useCallback(async (transaction: StockTransactionDTO) => {
    setConfirmationModal({
        isOpen: true,
        title: 'Restore Transaction',
        message: 'Are you sure you want to undo this reversal? This will restore the original transaction to the active list.',
        confirmText: 'Yes, Restore',
        onConfirm: async () => {
             setIsConfirmLoading(true);
             try {
                 await undoReverseTransaction(transaction.id);
                 addToast('Transaction restored successfully', 'success');
                 setConfirmationModal(prev => ({ ...prev, isOpen: false }));
             } catch (e) {
                 const errorMessage = e instanceof Error ? e.message : 'Failed to restore transaction';
                 addToast(errorMessage, 'error');
             } finally {
                 setIsConfirmLoading(false);
             }
        }
    });
  }, [undoReverseTransaction, addToast]);

  const openSupplierDetail = useCallback((supplier: Supplier) => {
    setSelectedItem(supplier);
    setDrawerType('SUPPLIER_DETAIL');
    setDrawerOpen(true);
  }, []);

  const openOrderForm = useCallback((supplier: Supplier) => {
    setSelectedItem(supplier);
    setDrawerType('ORDER_FORM');
    setDrawerOpen(true);
  }, []);

  const openAddStock = useCallback(() => {
    setSelectedItem(null);
    setDrawerType('ADD_STOCK');
    setDrawerOpen(true);
  }, []);

  const openAddSupplier = useCallback(() => {
    setSelectedItem(null);
    setDrawerType('ADD_SUPPLIER');
    setDrawerOpen(true);
  }, []);

  const openEditProfile = useCallback(() => {
      if (userProfile) {
        setSelectedItem(userProfile);
        setDrawerType('EDIT_PROFILE');
        setDrawerOpen(true);
      }
  }, [userProfile]);

  const openChangePassword = useCallback(() => {
      setSelectedItem(null);
      setDrawerType('CHANGE_PASSWORD');
      setDrawerOpen(true);
  }, []);

  const openAddUser = useCallback(() => {
      setSelectedItem(null);
      setDrawerType('ADD_USER');
      setDrawerOpen(true);
  }, []);

  const openDeactivateSupplier = useCallback((supplier: Supplier) => {
    setSelectedItem(supplier);
    setDrawerType('DEACTIVATE_SUPPLIER');
    setDrawerOpen(true);
  }, []);

  const openDeleteSupplier = useCallback((supplier: Supplier) => {
    setSelectedItem(supplier);
    setDrawerType('DELETE_SUPPLIER');
    setDrawerOpen(true);
  }, []);

  // Close Drawer
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => {
        setDrawerType('NONE');
        setSelectedItem(null);
    }, 300);
  }, []);

  // Transaction Handlers
  const handleStockInSubmit = useCallback(async (data: CreateTransactionRequest) => {
      await addTransaction(data);
      await Promise.all([refetchItems(), refetchReports(), refetchTransactions()]);
  }, [addTransaction, refetchItems, refetchReports, refetchTransactions]);

  const handleStockOutSubmit = useCallback(async (data: CreateTransactionRequest) => {
      await addTransaction(data);
      await Promise.all([refetchItems(), refetchReports(), refetchTransactions()]);
  }, [addTransaction, refetchItems, refetchReports, refetchTransactions]);

  const handleUpdateTransactionSubmit = useCallback(async (id: number, data: StockTransactionDTO) => {
      await updateTransaction(id, data);
      await refetchTransactions();
  }, [updateTransaction, refetchTransactions]);

  const handleReverseTransactionSubmit = useCallback(async (id: number, notes: string) => {
      await reverseTransaction(id, notes);
      await Promise.all([refetchTransactions(), refetchItems(), refetchReports()]);
  }, [reverseTransaction, refetchTransactions, refetchItems, refetchReports]);

  const handleUpdateItemSubmit = useCallback(async (id: number, data: UpdateItemRequest) => {
      await updateItem(id, data);
      await refetchItems();
  }, [updateItem, refetchItems]);

  const handleViewHistory = useCallback((itemId: number) => {
      setDrawerOpen(false);
      setTimeout(() => {
          setDrawerType('NONE');
          setSelectedItem(null);
          setView('TRANSACTIONS');
          setSelectedTransactionItem(itemId.toString());
      }, 300);
  }, []);

  const handleDeleteItemSubmit = useCallback(async (id: number, password: string) => {
      await deleteItem(id, password);
      await Promise.all([refetchItems(), refetchReports(), refetchTransactions()]);
  }, [deleteItem, refetchItems, refetchReports, refetchTransactions]);

  const handleDeactivateSupplierSubmit = useCallback(async (id: string, password: string) => {
      await deactivateSupplier(id, password);
      await refetchSuppliers();
  }, [deactivateSupplier, refetchSuppliers]);

  const handleDeleteSupplierSubmit = useCallback(async (id: string, password: string) => {
      await hardDeleteSupplier(id, password);
      await refetchSuppliers();
  }, [hardDeleteSupplier, refetchSuppliers]);

  const handleStockSuccess = useCallback(async () => {
      await Promise.all([refetchItems(), refetchReports(), refetchTransactions()]);
  }, [refetchItems, refetchReports, refetchTransactions]);

  const handleSupplierSuccess = useCallback(async () => {
      await refetchSuppliers();
  }, [refetchSuppliers]);

  const handleUserSuccess = useCallback(() => {
      setUsersRefreshTrigger(prev => prev + 1);
  }, []);
  
  const handleProfileSuccess = useCallback(() => {
      import('./api/services/userService').then(({ getProfile }) => {
          getProfile().then((data) => {
            setUserProfile(data);
            window.dispatchEvent(new Event('profile-updated'));
          });
      });
  }, []);

  // Filtered Items Logic
  const filteredStockItems = useMemo(() => stockItems.filter(item => {
      const matchesCategory = stockCategoryFilter ? item.category === stockCategoryFilter : true;
      const matchesStatus = stockStatusFilter ? item.status === stockStatusFilter : true;
      
      return matchesCategory && matchesStatus;
  }), [stockItems, stockCategoryFilter, stockStatusFilter]);

  // Paginated Stock Items
  const { totalStockPages, currentStockItems } = useMemo(() => {
    const total = Math.ceil(filteredStockItems.length / stockItemsPerPage);
    const start = (stockCurrentPage - 1) * stockItemsPerPage;
    const end = Math.min(start + stockItemsPerPage, filteredStockItems.length);
    const current = filteredStockItems.slice(start, end);
    return { totalStockPages: total, currentStockItems: current };
  }, [filteredStockItems, stockItemsPerPage, stockCurrentPage]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => Array.from(new Set(stockItems.map(item => item.category))), [stockItems]);

  // Drawer Content Renders
    const handleOrderSubmit = useCallback(async (data: { item: string; quantity: number; instructions: string }) => {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
    }, []);

    const handleAddSupplierSubmit = useCallback(async (data: CreateSupplierRequest) => {
        await addSupplier(data);
    }, [addSupplier]);

    const handleEditProfileSubmit = useCallback(async (data: UpdateProfileRequest) => {
        await updateProfile(data);
    }, [updateProfile]);

    const handleChangePasswordSubmit = useCallback(async (data: ChangePasswordRequest) => {
        await changePassword(data);
    }, [changePassword]);

    const handlePasswordChangeSuccess = useCallback(() => {
        setTimeout(() => {
            handleLogout();
        }, 1500);
    }, [handleLogout]);

    const handleAddUserSubmit = useCallback(async (data: CreateUserRequest) => {
        await createUser(data);
    }, [createUser]);

    const renderDrawerContent = () => {
    // ... (existing drawer content)
    if (drawerType === 'STOCK_IN' || drawerType === 'STOCK_OUT') {
        const isStockIn = drawerType === 'STOCK_IN';
        return isStockIn ? (
            <StockInForm
                stockItems={stockItems}
                suppliers={suppliers}
                onStockIn={handleStockInSubmit}
                onClose={closeDrawer}
                initialItem={selectedItem as StockItem}
                userProfileName={userProfile?.name}
                addToast={addToast}
                removeToast={removeToast}
            />
        ) : (
            <StockOutForm
                stockItems={stockItems}
                onStockOut={handleStockOutSubmit}
                onClose={closeDrawer}
                initialItem={selectedItem as StockItem}
                userProfileName={userProfile?.name}
                addToast={addToast}
                removeToast={removeToast}
            />
        );
    }

    if (drawerType === 'EDIT_TRANSACTION' && selectedItem) {
        return (
            <EditTransactionForm
                transaction={selectedItem as StockTransactionDTO}
                stockItems={stockItems}
                onUpdateTransaction={handleUpdateTransactionSubmit}
                onClose={closeDrawer}
                addToast={addToast}
                removeToast={removeToast}
            />
        );
    }

    if (drawerType === 'REVERSE_TRANSACTION' && selectedItem) {
        return (
            <ReverseTransactionForm
                transaction={selectedItem as StockTransactionDTO}
                onReverseTransaction={handleReverseTransactionSubmit}
                onClose={closeDrawer}
                addToast={addToast}
                removeToast={removeToast}
            />
        );
    }

    if (drawerType === 'STOCK_DETAIL' && selectedItem) {
        return (
            <StockDetail
                item={selectedItem as StockItem}
                onUpdateItem={handleUpdateItemSubmit}
                onClose={closeDrawer}
                onViewHistory={handleViewHistory}
                addToast={addToast}
                removeToast={removeToast}
            />
        );
    }

    if (drawerType === 'DELETE_ITEM' && selectedItem) {
        return (
            <DeleteItemForm
                item={selectedItem as StockItem}
                onDelete={handleDeleteItemSubmit}
                onClose={closeDrawer}
                addToast={addToast}
                removeToast={removeToast}
            />
        );
    }

    if (drawerType === 'DEACTIVATE_SUPPLIER' && selectedItem) {
        return (
            <DeactivateSupplierForm
                supplier={selectedItem as Supplier}
                onDeactivate={handleDeactivateSupplierSubmit}
                onClose={closeDrawer}
                addToast={addToast}
                removeToast={removeToast}
            />
        );
    }

    if (drawerType === 'DELETE_SUPPLIER' && selectedItem) {
        return (
            <DeleteSupplierForm
                supplier={selectedItem as Supplier}
                onDelete={handleDeleteSupplierSubmit}
                onClose={closeDrawer}
                addToast={addToast}
                removeToast={removeToast}
            />
        );
    }

    if (drawerType === 'ADD_STOCK') {
        return (
            <AddStockForm
                onAddItem={addItem}
                onAddTransaction={addTransaction}
                onSuccess={handleStockSuccess}
                onClose={closeDrawer}
                addToast={addToast}
                removeToast={removeToast}
            />
        );
    }

    if (drawerType === 'ADD_SUPPLIER') {
        return (
            <AddSupplierForm
                onAddSupplier={handleAddSupplierSubmit}
                onSuccess={handleSupplierSuccess}
                onClose={closeDrawer}
                addToast={addToast}
                removeToast={removeToast}
            />
        );
    }
    
    if (drawerType === 'SUPPLIER_DETAIL' && selectedItem) {
        return (
            <SupplierDetail
                supplier={selectedItem as Supplier}
                inactiveSuppliers={inactiveSuppliers}
                userProfile={userProfile}
                onClose={closeDrawer}
                onDeactivate={openDeactivateSupplier}
                onReactivate={reactivateSupplier}
                onDelete={openDeleteSupplier}
                onRefetch={refetchSuppliers}
                addToast={addToast}
                removeToast={removeToast}
            />
        );
    }

    if (drawerType === 'ORDER_FORM' && selectedItem) {
        return (
             <OrderForm
                supplier={selectedItem as Supplier}
                onOrder={handleOrderSubmit}
                onClose={closeDrawer}
                addToast={addToast}
                removeToast={removeToast}
             />
        )
    }

    if (drawerType === 'EDIT_PROFILE' && selectedItem) {
        return (
             <EditProfileForm
                 userProfile={selectedItem as UserProfile}
                 onUpdateProfile={handleEditProfileSubmit}
                 onSuccess={handleProfileSuccess}
                 onClose={closeDrawer}
                 addToast={addToast}
                 removeToast={removeToast}
             />
        );
    }

    if (drawerType === 'CHANGE_PASSWORD') {
        return (
             <ChangePasswordForm
                 onChangePassword={handleChangePasswordSubmit}
                 onSuccess={handlePasswordChangeSuccess}
                 onClose={closeDrawer}
                 addToast={addToast}
                 removeToast={removeToast}
             />
        );
    }

    if (drawerType === 'ADD_USER') {
        return (
             <AddUserForm
                 onCreateUser={handleAddUserSubmit}
                 onSuccess={handleUserSuccess}
                 onClose={closeDrawer}
                 addToast={addToast}
                 removeToast={removeToast}
             />
        );
    }

    // Check for reset password token
    if (resetToken) {
        return <ResetPasswordView token={resetToken} onSuccess={() => {
            setResetToken(null);
            handleLogout(); // Ensure user is logged out after reset
        }} />;
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
        case 'ADD_USER': return 'Create New User';
        case 'EDIT_TRANSACTION': return 'Edit Transaction';
        case 'REVERSE_TRANSACTION': return 'Reverse Transaction';
        case 'DEACTIVATE_SUPPLIER': return 'Deactivate Supplier';
        case 'DELETE_SUPPLIER': return 'Delete Supplier';
        default: return 'Details';
    }
  };

  const getDrawerSubtitle = () => {
     if (selectedItem && 'name' in selectedItem && selectedItem.name) return selectedItem.name;
     if (drawerType === 'ADD_STOCK') return 'Add a new product to inventory';
     if (drawerType === 'ADD_SUPPLIER') return 'Create a new partnership';
     if (drawerType === 'EDIT_PROFILE') return 'Update your personal information';
     if (drawerType === 'CHANGE_PASSWORD') return 'Secure your account';
     if (drawerType === 'STOCK_IN') return 'Add new inventory to the stock';
     if (drawerType === 'STOCK_OUT') return 'Remove inventory from the stock';
     if (drawerType === 'DELETE_ITEM') return 'Permanently remove this item';
     if (drawerType === 'ADD_USER') return 'Add a new member to the system';
     if (drawerType === 'EDIT_TRANSACTION') return 'Update transaction details';
     if (drawerType === 'REVERSE_TRANSACTION') return 'Correct a mistake';
     if (drawerType === 'DEACTIVATE_SUPPLIER') return 'Temporarily disable access';
     if (drawerType === 'DELETE_SUPPLIER') return 'Permanently remove supplier';
     return '';
  };

  // Drawer Footer Logic
  const getDrawerFooter = () => {
    if (drawerType === 'STOCK_IN' || drawerType === 'STOCK_OUT') {
        return (
            <button 
                type="submit"
                form="transaction-form"
                className="bg-[#1e293b] dark:bg-[#155DFC] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 transition-colors shadow-lg shadow-slate-900/10"
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
                className="bg-[#1e293b] dark:bg-[#155DFC] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 transition-colors shadow-lg shadow-slate-900/10"
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
                className="bg-[#1e293b] dark:bg-[#155DFC] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 transition-colors shadow-lg shadow-slate-900/10"
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
                className="bg-[#1e293b] dark:bg-[#155DFC] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 transition-colors shadow-lg shadow-slate-900/10"
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
                className="bg-[#1e293b] dark:bg-[#155DFC] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 transition-colors shadow-lg shadow-slate-900/10"
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
                className="bg-[#1e293b] dark:bg-[#155DFC] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 transition-colors shadow-lg shadow-slate-900/10"
            >
                Update Password
            </button>
        );
    }
    if (drawerType === 'ADD_USER') {
        return (
            <button 
                type="submit"
                form="add-user-form"
                className="bg-[#1e293b] dark:bg-[#155DFC] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 transition-colors shadow-lg shadow-slate-900/10"
            >
                Create User
            </button>
        );
    }
    if (drawerType === 'EDIT_TRANSACTION') {
        return null;
    }
    if (drawerType === 'REVERSE_TRANSACTION') {
        return (
            <button 
                type="submit"
                form="reverse-transaction-form"
                className="bg-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shadow-lg shadow-amber-900/10"
            >
                Confirm Reversal
            </button>
        );
    }
    if (drawerType === 'DEACTIVATE_SUPPLIER') {
        return null;
    }
    if (drawerType === 'DELETE_SUPPLIER') {
        return null;
    }
    if (drawerType === 'SUPPLIER_DETAIL') {
        const supplier = selectedItem as Supplier;
        const isInactive = inactiveSuppliers.some(s => s.id === supplier.id);
        
        if (isInactive) return null; // No "Create Order" for inactive suppliers

         return (
             <button 
                onClick={() => {
                    closeDrawer();
                    setTimeout(() => openOrderForm(selectedItem as Supplier), 300);
                }}
                className="bg-[#1e293b] dark:bg-[#155DFC] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 transition-colors"
             >
                Order Now
             </button>
         );
    }
    return null;
  }

  // Auth Flow
  if (!isLoggedIn) {
      // Check if we are in reset password mode (even if not logged in)
      if (resetToken) {
          return <ResetPasswordView token={resetToken} onSuccess={() => {
              setResetToken(null);
              handleLogout(); // Ensure user is logged out after reset
          }} />;
      }

      return (
        <>
            <LoginView onLogin={(token, email) => handleLogin(token, email)} />
        </>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50/50 dark:bg-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden transition-colors duration-300">
      
      {/* Header - Spans full width */}
      <Header onChangeView={setView} onMenuClick={() => setIsMobileMenuOpen(true)} />

      {/* Main Content Area - Flex Row */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar - Handles its own responsive states */}
        <Sidebar
            currentView={view}
            onChangeView={setView}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            userRole={userProfile?.role}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth min-w-0">
            <Suspense fallback={<LoadingSpinner />}>
            {/* ... views ... */}
            {view === 'DASHBOARD' && (
                <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
                    {/* ... dashboard content ... */}
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                        <div>
                             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h1>
                             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Welcome back, {userProfile?.name || 'User'}</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => handleDateFilter(dateRange === 'This Month' ? 'Last 3 Months' : 'This Month')}
                                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all shadow-sm"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>{dateRange}</span>
                            </button>
                            
                            {userProfile?.role === 'ADMIN' && (
                                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                                    <button 
                                        onClick={openAddStock}
                                        className="flex items-center gap-2 bg-[#1e293b] dark:bg-[#155DFC] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 hover:shadow-lg hover:shadow-slate-900/20 transition-all whitespace-nowrap active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>New Entry</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <DashboardStats onNavigate={setView} />

                    <DashboardCharts />

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        <div className="xl:col-span-3 overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-1">
                             <div className="flex justify-between items-center p-5 border-b border-slate-50 dark:border-slate-700">
                                <h3 className="font-bold text-slate-800 dark:text-white">Recent Inventory</h3>
                                <button 
                                    onClick={() => setView('TRANSACTIONS')}
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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
                                    <div className="p-4 text-center text-red-600 text-sm flex flex-col items-center justify-center gap-2">
                                        <p>Error loading data</p>
                                        <button 
                                            onClick={() => refetchReports()}
                                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : (
                                    <DashboardTable items={dashboardItems.slice(0, 6)} />
                                )}
                             </div>
                        </div>
                        <div className="xl:col-span-1">
                             <RecentActivity onViewAll={() => setView('TRANSACTIONS')} />
                        </div>
                    </div>
                </div>
            )}

            {view === 'STOCK' && (
                <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                         <div>
                             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Stock Management</h1>
                             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage and track your inventory items</p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => handleExport('CSV')}
                                className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                <span>Export CSV</span>
                                <FileSpreadsheet className="w-4 h-4" />
                            </button>
                            {userProfile?.role === 'ADMIN' && (
                                <button 
                                    onClick={openAddStock}
                                    className="flex items-center gap-2 bg-[#1e293b] dark:bg-[#155DFC] hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                                >
                                    <span>Add Item</span>
                                    <PlusCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="px-3 py-2 border-r border-slate-100 dark:border-slate-700 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>
                        
                        {/* Category Filter */}
                        <select 
                            value={stockCategoryFilter}
                            onChange={(e) => setStockCategoryFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border-none outline-none cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>

                        {/* Status Filter */}
                        <select 
                            value={stockStatusFilter}
                            onChange={(e) => setStockStatusFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border-none outline-none cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="Birahagije">Birahagije</option>
                            <option value="Mucye">Mucye</option>
                            <option value="Byashize">Byashize</option>
                        </select>

                        <div className="flex-1"></div>
                        
                        {/* View Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button 
                                onClick={() => setStockViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${stockViewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setStockViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${stockViewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {itemsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            <span className="ml-3 text-slate-600 dark:text-slate-400">Loading items...</span>
                        </div>
                    ) : itemsError ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                            <p className="text-red-800 dark:text-red-400 font-medium">Error loading items</p>
                            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{itemsError.message}</p>
                            <button 
                                onClick={() => refetchItems()}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredStockItems.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
                            <Box className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                            <p className="text-slate-600 dark:text-slate-300 font-medium">No items found</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Try adjusting your filters or add a new item</p>
                        </div>
                    ) : (
                        <>
                            {stockViewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {currentStockItems.map((item) => (
                                        <StockCard 
                                            key={item.id} 
                                            item={item} 
                                            onManage={openStockDetail}
                                            onDelete={openDeleteItem}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    {/* Mobile List View (Cards) */}
                                    <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                                        {currentStockItems.map((item) => (
                                             <div key={item.id} className="p-4 bg-white dark:bg-slate-800 flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                                        <div className="text-sm text-slate-500 dark:text-slate-400">{item.category}</div>
                                                    </div>
                                                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                        item.status === 'Birahagije' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                                        item.status === 'Mucye' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                                                        'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <div className="text-slate-500 dark:text-slate-400">
                                                        {item.currentQuantity} {item.unit}
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={() => openStockDetail(item)}
                                                            className="text-blue-600 dark:text-blue-400 font-medium text-xs"
                                                        >
                                                            Edit
                                                        </button>
                                                        {userProfile?.role === 'ADMIN' && (
                                                            <button 
                                                                onClick={() => openDeleteItem(item)}
                                                                className="text-rose-600 dark:text-rose-400 font-medium text-xs"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                             </div>
                                        ))}
                                    </div>
                                    
                                    <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-600">
                                            <tr>
                                                <th className="px-6 py-4">Item Name</th>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4 text-center">Unit</th>
                                                <th className="px-6 py-4 text-right">Current Stock</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {currentStockItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.category}</td>
                                                    <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">{item.unit}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">{item.currentQuantity}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                            item.status === 'Birahagije' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                                            item.status === 'Mucye' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                                                            'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => openStockDetail(item)}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs mr-3"
                                                        >
                                                            Edit
                                                        </button>
                                                        {userProfile?.role === 'ADMIN' && (
                                                            <button 
                                                                onClick={() => openDeleteItem(item)}
                                                                className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium text-xs"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalStockPages > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4 mt-6">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        Showing <span className="font-medium text-slate-900 dark:text-white">{(stockCurrentPage - 1) * stockItemsPerPage + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(stockCurrentPage * stockItemsPerPage, filteredStockItems.length)}</span> of <span className="font-medium text-slate-900 dark:text-white">{filteredStockItems.length}</span> results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setStockCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={stockCurrentPage === 1}
                                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Page {stockCurrentPage} of {totalStockPages}
                                        </span>
                                        <button
                                            onClick={() => setStockCurrentPage(p => Math.min(totalStockPages, p + 1))}
                                            disabled={stockCurrentPage === totalStockPages}
                                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {view === 'TRANSACTIONS' && (
                 <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Transactions</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Complete history of stock movements</p>
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

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <button className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium">
                                <Calendar className="w-4 h-4" />
                                <span>This Month</span>
                            </button>
                             <button className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium">
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>All Filters</span>
                            </button>
                            <div className="flex-1"></div>
                            <select 
                                value={selectedTransactionItem}
                                onChange={(e) => {
                                    setSelectedTransactionItem(e.target.value);
                                }}
                                className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium"
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
                                <span className="ml-3 text-slate-600 dark:text-slate-400">Loading transactions...</span>
                            </div>
                        ) : transactionsError ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                                <p className="text-red-800 dark:text-red-400 font-medium">Error loading transactions</p>
                                <p className="text-red-600 dark:text-red-300 text-sm mt-1">{transactionsError.message}</p>
                                <button 
                                    onClick={() => refetchTransactions()}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No transactions found</p>
                                <p className="text-sm mt-1">Transactions will appear here once you start recording stock movements</p>
                            </div>
                        ) : (
                            <TransactionsTable 
                                items={currentTransactions} 
                                showBalance={!!selectedTransactionItem} // Only show balance when filtered by item
                                onEdit={openEditTransaction}
                                onReverse={openReverseTransaction}
                                onUndoReverse={handleUndoReverseTransaction}
                                userPermissions={{
                                    canEdit: userProfile?.role === 'ADMIN',
                                    canReverse: userProfile?.role === 'ADMIN'
                                }}
                            />
                        )}
                        
                         <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-slate-500 dark:text-slate-400 gap-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                                {(() => {
                                    const startIndex = (currentTransactionPage - 1) * itemsPerPage;
                                    const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
                                    return (
                                        <div>Displaying <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredTransactions.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-semibold text-slate-700 dark:text-slate-300">{endIndex}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredTransactions.length}</span> transactions</div>
                                    );
                                })()}
                                <div className="flex items-center gap-2">
                                     <div className="flex items-center gap-2 mr-4">
                                        <span className="text-xs hidden sm:inline">Per page:</span>
                                        <select 
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentTransactionPage(1);
                                            }}
                                            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                     </div>

                                     <button 
                                         onClick={() => setCurrentTransactionPage(p => Math.max(1, p - 1))}
                                         disabled={currentTransactionPage === 1}
                                         className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                         <ChevronLeft className="w-3 h-3" />
                                         <span className="hidden sm:inline">Previous</span>
                                     </button>
                                     <div className="flex gap-1">
                                         {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                             let pageNum;
                                             if (totalPages <= 5) {
                                                 pageNum = i + 1;
                                             } else if (currentTransactionPage <= 3) {
                                                 pageNum = i + 1;
                                             } else if (currentTransactionPage >= totalPages - 2) {
                                                 pageNum = totalPages - 4 + i;
                                             } else {
                                                 pageNum = currentTransactionPage - 2 + i;
                                             }
                                             
                                             return (
                                                 <button 
                                                     key={pageNum}
                                                     onClick={() => setCurrentTransactionPage(pageNum)}
                                                     className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                                                         currentTransactionPage === pageNum
                                                             ? 'bg-[#1e293b] dark:bg-[#155DFC] text-white'
                                                             : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                     }`}
                                                 >
                                                     {pageNum}
                                                 </button>
                                             );
                                         })}
                                     </div>
                                      <button 
                                         onClick={() => setCurrentTransactionPage(p => Math.min(totalPages, p + 1))}
                                         disabled={currentTransactionPage === totalPages || totalPages === 0}
                                         className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                         <span className="hidden sm:inline">Next</span>
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
                             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
                             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Deep dive into inventory performance</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <button className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 transition-all shadow-sm">
                                <Calendar className="w-4 h-4" />
                                <span>Last 6 Months</span>
                            </button>
                            <button 
                                onClick={() => handleExport('Analytics')}
                                className="flex items-center gap-2 bg-[#1e293b] dark:bg-[#155DFC] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 transition-all shadow-lg shadow-slate-900/20"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>Export Report</span>
                            </button>
                        </div>
                     </div>

                     <AnalyticsStats />

                     <AnalyticsCharts />

                     <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    AI Intelligent Insight
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate a comprehensive analysis of your current stock health.</p>
                            </div>
                            <button 
                                onClick={handleGenerateReport}
                                disabled={loadingReport}
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 transition-all shadow-sm"
                            >
                                {loadingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                <span>{loadingReport ? 'Analyzing...' : 'Generate Analysis'}</span>
                            </button>
                        </div>
                        
                        {aiReport && (
                            <div className="p-8 prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-800">
                                <ReactMarkdown>{aiReport}</ReactMarkdown>
                            </div>
                        )}
                        
                        {!aiReport && !loadingReport && (
                            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
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
                             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Suppliers</h1>
                             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your partnerships</p>
                        </div>

                        {userProfile?.role === 'ADMIN' && (
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={openAddSupplier}
                                    className="flex items-center gap-2 bg-[#1e293b] dark:bg-[#155DFC] hover:bg-slate-800 dark:hover:bg-[#155DFC]/90 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                                >
                                    <span>Add Supplier</span>
                                    <PlusCircle className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tabs for Active/Inactive */}
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setShowInactiveSuppliers(false)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${!showInactiveSuppliers ? 'border-[#1e293b] text-[#1e293b] dark:text-[#155DFC] dark:border-[#155DFC]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                        >
                            Active Suppliers
                        </button>
                        <button
                            onClick={() => setShowInactiveSuppliers(true)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${showInactiveSuppliers ? 'border-[#1e293b] text-[#1e293b] dark:text-[#155DFC] dark:border-[#155DFC]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                        >
                            Inactive ({inactiveSuppliers.length})
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {!showInactiveSuppliers ? (
                            suppliers.length > 0 ? (
                                suppliers.map((supplier) => (
                                    <SupplierCard 
                                        key={supplier.id} 
                                        supplier={supplier} 
                                        isActive={true}
                                        onViewDetails={openSupplierDetail}
                                        onOrder={openOrderForm}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    No active suppliers found.
                                </div>
                            )
                        ) : (
                            inactiveSuppliers.length > 0 ? (
                                inactiveSuppliers.map((supplier) => (
                                    <SupplierCard 
                                        key={supplier.id} 
                                        supplier={supplier} 
                                        isActive={false}
                                        onViewDetails={openSupplierDetail}
                                        onReactivate={async (s) => {
                                            try {
                                                const toastId = addToast("Reactivating supplier...", 'loading');
                                                await reactivateSupplier(s.id);
                                                removeToast(toastId);
                                                addToast("Supplier reactivated.", 'success');
                                            } catch (e) {
                                                addToast("Failed to reactivate supplier.", 'error');
                                            }
                                        }}
                                        onDelete={() => openDeleteSupplier(supplier)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    No inactive suppliers found.
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {view === 'USERS' && <UsersView onAddUser={openAddUser} refreshTrigger={usersRefreshTrigger} />}
            {view === 'REPORT' && <ReportsView onGenerateReport={() => addToast('Generate Report feature is coming soon!', 'info')} />}
            {view === 'SETTINGS' && <SettingsView onChangePassword={openChangePassword} />}
            {view === 'NOTIFICATIONS' && <NotificationsView />}
            {view === 'PROFILE' && <ProfileView onEditProfile={openEditProfile} onChangePassword={openChangePassword} onLogout={handleLogout} addToast={addToast} />}

            {view !== 'DASHBOARD' && view !== 'STOCK' && view !== 'TRANSACTIONS' && view !== 'ANALYTICS' && view !== 'SUPPLIERS' && view !== 'REPORT' && view !== 'SETTINGS' && view !== 'NOTIFICATIONS' && view !== 'PROFILE' && view !== 'USERS' && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <p className="text-lg font-medium">Page under construction</p>
                    <p className="text-sm">Select a valid page from the sidebar.</p>
                </div>
            )}
            </Suspense>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.isDangerous ? 'danger' : 'info'}
        isLoading={isConfirmLoading}
      />

    </div>
  );
};

export default App;
