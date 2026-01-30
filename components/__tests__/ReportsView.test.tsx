import { render, screen, fireEvent } from '@testing-library/react';
import { ReportsView } from '../ReportsView';
import { vi, describe, it, expect } from 'vitest';

// Mock dependencies
vi.mock('../hooks/useItems', () => ({
    useItems: () => ({
        items: [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }],
    }),
}));

vi.mock('../context/ReportContext', () => ({
    useReportContext: () => ({
        reportHistory: [],
        addReportToHistory: vi.fn(),
        isGenerating: false,
        generateReport: vi.fn(),
    }),
}));

vi.mock('../../api/services/reportService', () => ({
    generateCsvReport: vi.fn(),
    generatePdfReport: vi.fn(),
    downloadReportById: vi.fn(),
    scheduleReport: vi.fn(),
    getScheduledReports: vi.fn(),
    deleteScheduledReport: vi.fn(),
}));

describe('ReportsView', () => {
    it('renders correctly', () => {
        render(<ReportsView onGenerateReport={() => {}} />);
        expect(screen.getByText('Stock Report')).toBeInTheDocument();
        expect(screen.getAllByText('Generate Report').length).toBeGreaterThan(0);
    });

    it('has "Schedule Reports" button with correct color', () => {
        render(<ReportsView onGenerateReport={() => {}} />);
        const scheduleButton = screen.getByText('Schedule Reports').closest('button');
        expect(scheduleButton).toHaveClass('bg-[#1e293b]');
    });

    it('opens modal when "Schedule Reports" is clicked', () => {
        render(<ReportsView onGenerateReport={() => {}} />);
        const scheduleButton = screen.getByText('Schedule Reports');
        fireEvent.click(scheduleButton);
        expect(screen.getByText('Automated email reporting')).toBeInTheDocument();
    });
    
    it('toggles view all history', () => {
        render(<ReportsView onGenerateReport={() => {}} />);
        const viewAllButton = screen.getByText('View All');
        fireEvent.click(viewAllButton);
        expect(screen.getByText('All Generated Reports')).toBeInTheDocument();
        expect(screen.getByText('Back to Generator')).toBeInTheDocument();
    });
});
