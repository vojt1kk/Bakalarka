import { CircleCheck, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import type { RepDetectorState, RepFeedback, RepSectionFeedback } from '@/types';

const STATE_LABELS: Record<RepDetectorState, string> = {
    calibrating: 'Kalibrace postoje',
    calibration_failed: 'Nedaří se kalibrovat',
    start: 'Výchozí pozice',
    descending: 'Klesání',
    bottom: 'Bod obratu',
    ascending: 'Stoupání',
};

function SectionRow({ title, section }: { title: string; section: RepSectionFeedback }) {
    const isOk = section.status === 'ok';
    const Icon = isOk ? CircleCheck : TriangleAlert;

    return (
        <div className="flex items-start gap-3">
            <Icon
                aria-hidden="true"
                className={`mt-0.5 size-5 shrink-0 ${isOk ? 'text-primary' : 'text-amber-400'}`}
            />
            <div className="min-w-0 space-y-0.5">
                <h4 className="text-sm font-medium">
                    {title}
                    <span className="sr-only">{isOk ? ' – v pořádku' : ' – upozornění'}</span>
                </h4>
                <p className="text-sm text-muted-foreground">{section.correction}</p>
            </div>
        </div>
    );
}

export default function RepFeedbackPanel({
    feedback,
    isLoading,
    repCount,
    state,
    error,
}: {
    feedback: RepFeedback | null;
    isLoading: boolean;
    repCount: number;
    state: RepDetectorState;
    error: string | null;
}) {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                    Zpětná vazba
                    {isLoading && <Spinner />}
                </h3>
                <div className="flex gap-2">
                    <Badge variant="outline">{STATE_LABELS[state]}</Badge>
                    <Badge>{repCount} opak.</Badge>
                </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {!feedback && !isLoading && !error && (
                <p className="text-sm text-muted-foreground">
                    Proveď první opakování a po jeho dokončení se zde zobrazí hodnocení.
                </p>
            )}

            {feedback && (
                <div className="space-y-4">
                    <SectionRow title="Výchozí pozice" section={feedback.startPosition} />
                    <SectionRow title="Bod obratu" section={feedback.bottomPosition} />
                    <SectionRow title="Tempo" section={feedback.tempo} />
                    <p className="text-sm text-muted-foreground italic">{feedback.encouragement}</p>
                </div>
            )}
        </section>
    );
}
