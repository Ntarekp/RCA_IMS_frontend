import { Loader2 } from 'lucide-react';

export const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
);
