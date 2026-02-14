import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { CoachingFeedback } from '@/types';

export default function FeedbackPanel({
    feedback,
    isLoading,
    repCount,
    currentPhase,
    error,
}: {
    feedback: CoachingFeedback | null;
    isLoading: boolean;
    repCount: number;
    currentPhase: string;
    error: string | null;
}) {
    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Session</span>
                        <div className="flex gap-2">
                            {currentPhase && <Badge variant="outline">{currentPhase}</Badge>}
                            <Badge>{repCount} reps</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Coaching Feedback
                        {isLoading && <Spinner />}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-sm text-destructive">{error}</p>}

                    {!feedback && !isLoading && !error && (
                        <p className="text-sm text-muted-foreground">
                            Start exercising to receive AI coaching feedback.
                        </p>
                    )}

                    {feedback && (
                        <div className="space-y-4">
                            <p className="text-sm">{feedback.overallFeedback}</p>

                            {feedback.jointCorrections.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Corrections</h4>
                                    {feedback.jointCorrections.map((correction, idx) => (
                                        <div key={idx} className="flex gap-2 text-sm">
                                            <Badge variant="destructive" className="shrink-0">
                                                {correction.joint}
                                            </Badge>
                                            <span className="text-muted-foreground">{correction.correction}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-sm italic text-muted-foreground">{feedback.encouragement}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
