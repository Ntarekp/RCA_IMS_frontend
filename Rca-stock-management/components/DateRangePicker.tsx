import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

// --- Date Helpers ---
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const formatDate = (date: Date): string => {
    const d = date.getDate();
    const m = MONTH_NAMES[date.getMonth()].substring(0, 3);
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
};

const formatYYYYMMDD = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust to make Monday 0, Sunday 6
};

const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
};

const isBetween = (date: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    const d = date.getTime();
    return d > start.getTime() && d < end.getTime();
};

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onChange: (start: string, end: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date()); // The date that determines the first month shown
    const [tempStart, setTempStart] = useState<Date | null>(null);
    const [tempEnd, setTempEnd] = useState<Date | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize state from props
    useEffect(() => {
        if (startDate) {
            const start = new Date(startDate);
            setTempStart(start);
            setViewDate(start);
        }
        if (endDate) {
            setTempEnd(new Date(endDate));
        }
    }, [startDate, endDate]);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDayClick = (date: Date) => {
        if (!tempStart || (tempStart && tempEnd)) {
            // Start new selection
            setTempStart(date);
            setTempEnd(null);
        } else {
            // Complete selection
            if (date < tempStart) {
                setTempEnd(tempStart);
                setTempStart(date);
            } else {
                setTempEnd(date);
            }
        }
    };

    const handleApply = () => {
        if (tempStart && tempEnd) {
            onChange(formatYYYYMMDD(tempStart), formatYYYYMMDD(tempEnd));
            setIsOpen(false);
        }
    };

    const handleCancel = () => {
        if (startDate) setTempStart(new Date(startDate));
        else setTempStart(null);
        
        if (endDate) setTempEnd(new Date(endDate));
        else setTempEnd(null);
        
        setIsOpen(false);
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const renderMonth = (offset: number) => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth() + offset;
        const currentMonthDate = new Date(year, month, 1);
        const displayYear = currentMonthDate.getFullYear();
        const displayMonth = currentMonthDate.getMonth();
        
        const daysInMonth = getDaysInMonth(displayYear, displayMonth);
        const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
        
        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(displayYear, displayMonth, d);
            const isStart = isSameDay(date, tempStart);
            const isEnd = isSameDay(date, tempEnd);
            const isInRange = isBetween(date, tempStart, tempEnd);
            
            let className = "h-10 w-10 flex items-center justify-center text-sm rounded-full cursor-pointer transition-all relative z-10 ";
            
            if (isStart) className += "bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/30 ";
            else if (isEnd) className += "bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/30 ";
            else if (isInRange) className += "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-none ";
            else className += "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 ";

            // Logic for connecting rounded ends
            const isRangeStart = isStart && tempEnd;
            const isRangeEnd = isEnd && tempStart;
            
            days.push(
                <div key={d} className="relative p-0 m-0">
                   {isInRange && (
                       <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/30" />
                   )}
                   {isRangeStart && (
                        <div className="absolute top-0 bottom-0 right-0 w-1/2 bg-blue-50 dark:bg-blue-900/30" />
                   )}
                   {isRangeEnd && (
                        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-blue-50 dark:bg-blue-900/30" />
                   )}
                    <button 
                        onClick={() => handleDayClick(date)}
                        className={className}
                    >
                        {d}
                    </button>
                </div>
            );
        }
        
        return (
            <div className="p-4 w-full sm:w-[320px]">
                <div className="flex items-center justify-center mb-6">
                    <span className="font-bold text-slate-800 dark:text-white text-base">
                        {MONTH_NAMES[displayMonth]} {displayYear}
                    </span>
                </div>
                <div className="grid grid-cols-7 gap-y-2 mb-2">
                    {WEEK_DAYS.map(day => (
                        <div key={day} className="h-8 flex items-center justify-center text-xs font-bold text-slate-400">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {days}
                </div>
            </div>
        );
    };

    const daysDuration = tempStart && tempEnd 
        ? Math.round(Math.abs((tempEnd.getTime() - tempStart.getTime()) / (1000 * 60 * 60 * 24))) + 1 
        : 0;

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-white dark:bg-slate-700 border-2 rounded-xl px-4 py-3 cursor-pointer shadow-sm hover:shadow-md transition-all group ${
                    isOpen ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
            >
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                     {tempStart ? formatDate(tempStart) : 'Select Date'} 
                     <span className="text-slate-400 mx-2">—</span> 
                     {tempEnd ? formatDate(tempEnd) : 'Select Date'}
                </div>
                <CalendarIcon className={`w-5 h-5 transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 max-w-[90vw] sm:max-w-none">
                    <div className="flex flex-col md:flex-row relative">
                         {/* Navigation Arrows */}
                        <button 
                            onClick={() => changeMonth(-1)}
                            className="absolute left-2 top-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full z-20 text-slate-600 dark:text-slate-300"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                         <button 
                            onClick={() => changeMonth(1)}
                            className="absolute right-2 top-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full z-20 text-slate-600 dark:text-slate-300"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
                            {renderMonth(0)}
                        </div>
                        <div className="hidden md:block">
                            {renderMonth(1)}
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {daysDuration > 0 ? `${daysDuration} days` : 'Select range'}
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleApply}
                                disabled={!tempStart || !tempEnd}
                                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
