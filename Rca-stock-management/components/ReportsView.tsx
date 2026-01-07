import React, { useCallback, useMemo, useState } from 'react';
import {
    FileSpreadsheet,
    FileText,
    Calendar,
    Download,
    Filter,
    Loader2,
    Clock,
    ArrowDownUp,
    Eye,
    ChevronDown,
    CalendarDays
} from 'lucide-react';
import { generateCsvReport, generatePdfReport, ReportType } from '../api/services/reportService';
import { useItems } from '../hooks/useItems';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface RecentReport {
    id: string;
    title: string;
    date: string;
    type: ReportType;
    format: 'PDF' | 'CSV';
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export const ReportsView: React.FC = () => {
    const { items } = useItems();

    const [reportType, setReportType] = useState<ReportType>('transactions');
    const [format, setFormat] = useState<'PDF' | 'CSV'>('CSV');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [recentReports, setRecentReports] = useState<RecentReport[]>([]);

    const [dateRange, setDateRange] = useState(() => ({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    }));

    /* ------------------------------------------------------------------------ */
    /*                                DERIVED DATA                               */
    /* ------------------------------------------------------------------------ */

    const isDateRangeRequired = useMemo(
        () => ['transactions', 'stock-in', 'stock-out'].includes(reportType),
        [reportType]
    );

    /* ------------------------------------------------------------------------ */
    /*                                HANDLERS                                   */
    /* ------------------------------------------------------------------------ */

    const handleGenerate = useCallback(async () => {
        setIsGenerating(true);

        try {
            const itemId = selectedItemId ? Number(selectedItemId) : undefined;
            const range = isDateRangeRequired ? dateRange : undefined;

            if (format === 'CSV') {
                await generateCsvReport(reportType, itemId, range);
            } else {
                await generatePdfReport(reportType, itemId, range);
            }

            setRecentReports(prev => [
                {
                    id: crypto.randomUUID(),
                    title: `${reportType.replace('-', ' ').toUpperCase()} REPORT`,
                    date: new Date().toLocaleDateString(),
                    type: reportType,
                    format
                },
                ...prev
            ]);
        } catch (err) {
            console.error('Report generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    }, [reportType, format, selectedItemId, dateRange, isDateRangeRequired]);

    const generateQuick = (days?: number, type?: ReportType) => {
        if (days) {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - days);
            setReportType('transactions');
            setDateRange({
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0]
            });
        }

        if (type) setReportType(type);
    };

    /* ------------------------------------------------------------------------ */
    /*                                   RENDER                                   */
    /* ------------------------------------------------------------------------ */

    return (
        <section className="max-w-[1600px] mx-auto space-y-10 pb-12 animate-in fade-in">

            {/* ------------------------------------------------------------------ */}
            {/* HEADER                                                             */}
            {/* ------------------------------------------------------------------ */}

            <header className="flex flex-col gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
                <p className="text-slate-500 max-w-2xl">
                    Generate professional, export-ready inventory and transaction reports
                    with flexible filters and formats.
                </p>

                <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-xl border shadow-sm w-fit">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={e => setDateRange(p => ({ ...p, startDate: e.target.value }))}
                        className="text-sm font-medium outline-none"
                    />
                    <span className="text-slate-400">–</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={e => setDateRange(p => ({ ...p, endDate: e.target.value }))}
                        className="text-sm font-medium outline-none"
                    />
                </div>
            </header>

            {/* ------------------------------------------------------------------ */}
            {/* QUICK ACTIONS                                                       */}
            {/* ------------------------------------------------------------------ */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <aside className="space-y-5">
                    <div className="bg-slate-50 rounded-2xl border p-6">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-blue-600" /> Quick Reports
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <QuickButton label="Last 7 Days" onClick={() => generateQuick(7)} />
                            <QuickButton label="Last 30 Days" onClick={() => generateQuick(30)} />
                            <QuickButton label="Stock In" onClick={() => generateQuick(undefined, 'stock-in')} />
                            <QuickButton label="Stock Out" onClick={() => generateQuick(undefined, 'stock-out')} />
                        </div>
                    </div>
                </aside>

                {/* ---------------------------------------------------------------- */}
                {/* REPORT BUILDER                                                    */}
                {/* ---------------------------------------------------------------- */}

                <main className="lg:col-span-2 bg-slate-50 rounded-2xl border p-6 flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-600" /> Custom Report Builder
                        </h2>
                        <p className="text-sm text-slate-500">Fine‑tune every detail before exporting</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 flex-1">

                        <SelectField
                            label="Report Type"
                            value={reportType}
                            onChange={e => setReportType(e.target.value as ReportType)}
                        >
                            <option value="transactions">Transactions</option>
                            <option value="balance">Stock Balance</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="suppliers">Suppliers</option>
                        </SelectField>

                        <SelectField
                            label="Item Filter"
                            value={selectedItemId}
                            disabled={reportType !== 'transactions'}
                            onChange={e => setSelectedItemId(e.target.value)}
                        >
                            <option value="">All Items</option>
                            {items.map(i => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                            ))}
                        </SelectField>

                        <FormatToggle format={format} setFormat={setFormat} />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="mt-8 bg-slate-900 text-white py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition shadow-lg"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Download />}
                        {isGenerating ? 'Generating…' : 'Generate Report'}
                    </button>
                </main>
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* RECENT REPORTS                                                      */}
            {/* ------------------------------------------------------------------ */}

            <section className="bg-slate-50 rounded-2xl border overflow-hidden">
                <div className="px-6 py-4 border-b font-semibold">Recent Reports</div>

                {recentReports.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                        <FileText className="mx-auto mb-3 opacity-20" size={40} />
                        No reports generated yet
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-white/60 text-slate-500">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Format</th>
                            <th className="text-right px-6">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {recentReports.map(r => (
                            <tr key={r.id} className="hover:bg-white">
                                <td className="px-6 py-4 font-medium">{r.title}</td>
                                <td>{r.date}</td>
                                <td className="capitalize">{r.type.replace('-', ' ')}</td>
                                <td>{r.format}</td>
                                <td className="px-6 text-right">
                                    <button className="p-2 hover:bg-slate-100 rounded"><Eye size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>
        </section>
    );
};

/* -------------------------------------------------------------------------- */
/*                               SUB COMPONENTS                               */
/* -------------------------------------------------------------------------- */

const QuickButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="h-28 rounded-xl border bg-white hover:shadow-md transition flex flex-col items-center justify-center gap-2"
    >
        <ArrowDownUp className="text-blue-600" />
        <span className="text-sm font-medium">{label}</span>
    </button>
);

const SelectField = ({ label, children, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="relative">
            <select
                {...props}
                className="w-full appearance-none px-4 py-3 rounded-xl border bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20"
            >
                {children}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
    </div>
);

const FormatToggle = ({ format, setFormat }: any) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Format</label>
        <div className="grid grid-cols-2 gap-3">
            <button
                onClick={() => setFormat('CSV')}
                className={`rounded-xl py-3 flex justify-center gap-2 border ${format === 'CSV' ? 'ring-2 ring-emerald-500/20 border-emerald-500 text-emerald-700' : 'bg-white'}`}
            >
                <FileSpreadsheet size={16} /> CSV
            </button>
            <button
                onClick={() => setFormat('PDF')}
                className={`rounded-xl py-3 flex justify-center gap-2 border ${format === 'PDF' ? 'ring-2 ring-red-500/20 border-red-500 text-red-700' : 'bg-white'}`}
            >
                <FileText size={16} /> PDF
            </button>
        </div>
    </div>
);
