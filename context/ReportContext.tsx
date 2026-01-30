import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { generateCsvReport, generatePdfReport, getReportHistory, getBalanceReport, getLowStockReport } from '../api/services/reportService';
import { SystemReport, StockBalanceDTO } from '../types';
import { mapStockBalanceToDashboardItem } from '../utils/mappers';
import { DashboardItem } from '../types';
import { useToast } from './ToastContext';

export type ReportType = 'balance' | 'low-stock' | 'stock-in' | 'stock-out' | 'damaged' | 'transactions' | 'suppliers';

interface ReportGenerationConfig {
    type: ReportType;
    dateRange?: { startDate: string; endDate: string };
    format: 'PDF' | 'CSV';
    itemId?: string;
    action?: 'download' | 'view';
    title?: string;
}

interface ReportContextType {
    reportHistory: SystemReport[];
    balanceReport: StockBalanceDTO[];
    lowStockItems: StockBalanceDTO[];
    dashboardItems: DashboardItem[];
    loading: boolean;
    error: Error | null;
    isGenerating: boolean;
    generateReport: (config: ReportGenerationConfig) => Promise<void>;
    refreshHistory: () => Promise<void>;
    addReportToHistory: (report: SystemReport) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReportContext = () => {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error('useReportContext must be used within a ReportProvider');
    }
    return context;
};

export const ReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addToast } = useToast();
    const [reportHistory, setReportHistory] = useState<SystemReport[]>([]);
    const [balanceReport, setBalanceReport] = useState<StockBalanceDTO[]>([]);
    const [lowStockItems, setLowStockItems] = useState<StockBalanceDTO[]>([]);
    const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchReports = useCallback(async () => {
        try {
            // Background refresh
            setError(null);
            const [balance, lowStock, history] = await Promise.all([
                getBalanceReport(),
                getLowStockReport(),
                getReportHistory(),
            ]);
            
            setBalanceReport(balance);
            setLowStockItems(lowStock);
            setReportHistory(history);
            
            const dashboardData = balance.map(mapStockBalanceToDashboardItem);
            setDashboardItems(dashboardData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch reports'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            fetchReports();
        } else {
            setLoading(false);
        }
    }, [fetchReports]);

    const addReportToHistory = useCallback((report: SystemReport) => {
        setReportHistory(prev => [report, ...prev]);
    }, []);

    const generateReport = useCallback(async (config: ReportGenerationConfig) => {
        // Optimistic update
        const tempId = Math.random().toString(36).substr(2, 9);
        const { type, dateRange, format, itemId, action = 'download', title } = config;

        const optimisticReport: SystemReport = {
            id: tempId,
            title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
            generatedDate: new Date().toLocaleDateString(),
            type: type.toUpperCase() as any,
            format: format,
            status: 'PROCESSING',
            size: '0 KB',
            params: {
                reportType: type,
                dateRange: dateRange,
                itemId: itemId
            }
        };

        addReportToHistory(optimisticReport);
        setIsGenerating(true);
        
        addToast(`Generating ${optimisticReport.title}...`, 'info');

        try {
            const numItemId = itemId ? parseInt(itemId) : undefined;
            
            let blob: Blob;
            if (format === 'PDF') {
                blob = await generatePdfReport(type, numItemId, dateRange, action === 'download', title);
            } else {
                blob = await generateCsvReport(type, numItemId, dateRange, action === 'download', title);
            }

            if (action === 'view') {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            }

            addToast(`${optimisticReport.title} is ready!`, 'success');
            await fetchReports();

        } catch (error) {
            console.error('Report generation failed:', error);
            addToast(`Failed to generate ${optimisticReport.title}`, 'error');
            
            setReportHistory(prev => prev.map(r => 
                r.id === tempId ? { ...r, status: 'FAILED' } : r
            ));
        } finally {
            setIsGenerating(false);
        }
    }, [addToast, fetchReports, addReportToHistory]);

    return (
        <ReportContext.Provider value={{
            reportHistory,
            balanceReport,
            lowStockItems,
            dashboardItems,
            loading,
            error,
            isGenerating,
            generateReport,
            refreshHistory: fetchReports,
            addReportToHistory
        }}>
            {children}
        </ReportContext.Provider>
    );
};
