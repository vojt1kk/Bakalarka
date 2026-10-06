import { Head } from '@inertiajs/react';
import { Play, BookOpen, Camera } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import RepFeedbackPanel from '@/components/coaching/rep-feedback-panel';
import WebcamView from '@/components/coaching/webcam-view';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePoseLandmarker } from '@/hooks/use-pose-landmarker';
import { useRepCounter } from '@/hooks/use-rep-counter';
import { useRepFeedback } from '@/hooks/use-rep-feedback';
import AppLayout from '@/layouts/app-layout';
import { exercises } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { ExerciseReference, FrameSize, Point3D } from '@/types/coaching';

type Exercise = {
    id: number;
    name: string;
    description: string;
    instructions: string | null;
    video_path: string | null;
    ppl_type: string | null;
    ul_type: string | null;
    muscle_types: string[];
};

export default function ExerciseShow({
    exercise,
    referenceAngles,
}: {
    exercise: Exercise;
    referenceAngles: ExerciseReference;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const gifCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const { deviations, processLandmarks, resetCount } = useRepCounter(referenceAngles);
    const supportsRepFeedback = referenceAngles.tempo !== undefined;
    const {
        repCount: detectedRepCount,
        state: repState,
        lastFeedback: repFeedback,
        isLoading: repFeedbackLoading,
        error: repFeedbackError,
        processLandmarks: processRepLandmarks,
        flush: flushRepFeedback,
        reset: resetRepFeedback,
    } = useRepFeedback(exercise.id, referenceAngles);

    const handlePoseFrame = useCallback(
        (frameLandmarks: Point3D[], mediaTimestampMs: number, frame: FrameSize) => {
            if (supportsRepFeedback) {
                processRepLandmarks(frameLandmarks, mediaTimestampMs, frame);
            }
        },
        [supportsRepFeedback, processRepLandmarks],
    );

    const {
        landmarks,
        isLoading,
        isRunning,
        isVideoFile,
        isGif,
        mediaAspectRatio,
        error: poseError,
        start,
        startWithFile,
        stop,
    } = usePoseLandmarker(videoRef, canvasRef, gifCanvasRef, handlePoseFrame);

    useEffect(() => {
        if (landmarks) {
            processLandmarks(landmarks);
        }
    }, [landmarks, processLandmarks]);

    useEffect(() => {
        if (!isRunning) {
            flushRepFeedback();
        }
    }, [isRunning, flushRepFeedback]);

    const handleStartWithFile = (file: File) => {
        resetCount();
        resetRepFeedback();
        startWithFile(file);
    };

    const handleStop = () => {
        stop();
        resetCount();
        resetRepFeedback();
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Exercises', href: exercises().url },
        { title: exercise.name, href: `/exercises/${exercise.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={exercise.name} />

            <div className="flex flex-col gap-4 p-4 pb-8">
                {/* Exercise Header */}
                <section className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {exercise.ppl_type && (
                            <Badge variant="outline" className="border-primary/30 bg-primary/10 font-medium text-primary">
                                {exercise.ppl_type}
                            </Badge>
                        )}
                        {exercise.ul_type && (
                            <Badge variant="outline" className="font-medium">
                                {exercise.ul_type}
                            </Badge>
                        )}
                        {exercise.muscle_types.map((muscle) => (
                            <Badge key={muscle} variant="secondary" className="text-xs">
                                {muscle}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
                        {exercise.name}
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{exercise.description}</p>
                </section>

                {/* Main grid: camera left, info right on desktop */}
                <div className="grid gap-4 lg:grid-cols-[3fr_2fr] lg:items-start">
                    {/* Camera column */}
                    <Card className="overflow-hidden border-primary/20 bg-card">
                        <CardHeader className="border-b border-border bg-primary/5 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                                    <Camera className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <CardTitle className="text-base font-semibold">Workout Mode</CardTitle>
                                    <CardDescription className="text-xs">AI-powered form analysis</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <WebcamView
                                videoRef={videoRef}
                                canvasRef={canvasRef}
                                gifCanvasRef={gifCanvasRef}
                                landmarks={landmarks}
                                deviations={deviations}
                                isLoading={isLoading}
                                isRunning={isRunning}
                                isVideoFile={isVideoFile}
                                isGif={isGif}
                                mediaAspectRatio={mediaAspectRatio}
                                error={poseError}
                                onStart={start}
                                onStartWithFile={handleStartWithFile}
                                onStop={handleStop}
                            />
                        </CardContent>
                    </Card>

                    {/* Info column: feedback + video + instructions */}
                    <div className="flex flex-col gap-4">
                        {supportsRepFeedback && (
                            <RepFeedbackPanel
                                feedback={repFeedback}
                                isLoading={repFeedbackLoading}
                                repCount={detectedRepCount}
                                state={repState}
                                error={repFeedbackError}
                            />
                        )}

                        {exercise.video_path && (
                            <Card className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                                            <Play className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <CardTitle className="text-base font-semibold">Reference Video</CardTitle>
                                    </div>
                                    <CardDescription>Watch the proper form before starting.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
                                        <div className="aspect-video">
                                            <video
                                                src={exercise.video_path}
                                                controls
                                                className="h-full w-full object-cover"
                                                preload="metadata"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {exercise.instructions && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                                            <BookOpen className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <CardTitle className="text-base font-semibold">Instructions</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border-l-2 border-primary/30 bg-muted/30 px-5 py-4">
                                        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                                            {exercise.instructions}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
