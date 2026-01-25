import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScheduledReportModal } from '../ScheduledReportModal';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as reportService from '../../api/services/reportService';

vi.mock('../../api/services/reportService', () => ({
    scheduleReport: vi.fn(),
    getScheduledReports: vi.fn().mockResolvedValue([]),
    deleteScheduledReport: vi.fn(),
}));

describe('ScheduledReportModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders when open', () => {
        render(<ScheduledReportModal isOpen={true} onClose={() => {}} />);
        expect(screen.getByText('Automated email reporting')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<ScheduledReportModal isOpen={false} onClose={() => {}} />);
        expect(screen.queryByText('Automated email reporting')).not.toBeInTheDocument();
    });

    it('calls scheduleReport on valid submission', async () => {
        const mockScheduleReport = vi.mocked(reportService.scheduleReport).mockResolvedValue({
            id: 1,
            reportType: 'TRANSACTION_HISTORY',
            frequency: 'DAILY',
            email: 'test@example.com',
            active: true
        });

        render(<ScheduledReportModal isOpen={true} onClose={() => {}} />);
        
        // Switch to Schedule New Report tab
        const newReportTab = screen.getByText('Schedule New Report');
        fireEvent.click(newReportTab);
        
        fireEvent.change(screen.getByPlaceholderText('Enter recipient email'), { target: { value: 'test@example.com' } });
        
        const scheduleButton = screen.getByText('Save Schedule');
        fireEvent.click(scheduleButton);
        
        await waitFor(() => {
            expect(mockScheduleReport).toHaveBeenCalledWith(expect.objectContaining({
                email: 'test@example.com'
            }));
        });
    });
});
