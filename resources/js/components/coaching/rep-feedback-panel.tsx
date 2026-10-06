import { CircleCheck, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { RepDetectorState, RepFeedback, RepSectionFeedback } from '@/types';

const STATE_LABELS: Record<RepDetectorState, string> = {
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
                className={`mt-0.5 size-5 shrink-0 ${isOk ? 'text-green-600 dark:text-green-500' : 'text-amber-600 dark:text-amber-500'}`}
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
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                        <span>Cvičení</span>
                        <div className="flex gap-2">
                            <Badge variant="outline">{STATE_LABELS[state]}</Badge>
                            <Badge>{repCount} opak.</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Zpětná vazba k opakování
                        {isLoading && <Spinner />}
                    </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </div>
    );
}
