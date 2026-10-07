import { CircleCheck, TriangleAlert } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { PreflightStatus } from '@/types';

export type PreflightItem = {
    label: string;
    status: PreflightStatus;
    hint?: string;
    onRetry?: () => void;
};

export default function PreflightChecklist({ items }: { items: PreflightItem[] }) {
    return (
        <section className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-foreground">Příprava</h3>
            <ul className="flex flex-col gap-2">
                {items.map((item) => (
                    <li key={item.label} className="flex items-start gap-2">
                        {item.status === 'pending' && <Spinner className="mt-0.5 size-4 shrink-0" />}
                        {item.status === 'ready' && (
                            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                        )}
                        {item.status === 'error' && (
                            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
                        )}
                        <div className="min-w-0 flex-1 text-sm">
                            <p className={item.status === 'ready' ? 'text-foreground' : 'text-muted-foreground'}>
                                {item.label}
                            </p>
                            {item.hint && <p className="text-xs text-muted-foreground">{item.hint}</p>}
                            {item.status === 'error' && item.onRetry && (
                                <button
                                    type="button"
                                    onClick={item.onRetry}
                                    className="text-xs text-foreground underline underline-offset-2 hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    Zkusit znovu
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
