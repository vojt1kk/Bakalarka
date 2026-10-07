import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import RepFeedbackPanel from '@/components/coaching/rep-feedback-panel';
import WebcamView, { WebcamControls } from '@/components/coaching/webcam-view';
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

            <div className="flex flex-col gap-4 p-4">
                <header className="flex h-10 items-center gap-3">
                    <Link
                        href={exercises()}
                        prefetch
                        aria-label="Back to exercises"
                        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <ChevronLeft className="size-4" />
                    </Link>
                    <h1 className="shrink-0 text-2xl font-bold tracking-tight text-foreground">{exercise.name}</h1>
                    {exercise.muscle_types.length > 0 && (
                        <p className="line-clamp-2 text-sm leading-tight text-muted-foreground first-letter:uppercase">
                            {exercise.muscle_types.join(', ')}
                        </p>
                    )}
                </header>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
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
                        className="h-[55dvh] min-h-80 lg:h-[calc(100dvh-14rem)]"
                    />

                    <aside className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 lg:h-[calc(100dvh-14rem)] lg:min-h-80">
                        <div className="flex flex-1 flex-col gap-6 lg:overflow-y-auto">
                            <section className="flex flex-col gap-3">
                                <h2 className="text-lg font-semibold text-foreground">Before you start</h2>
                                {exercise.instructions && (
                                    <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/85">
                                        {exercise.instructions}
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground">Stand side-on with your whole body in frame.</p>
                            </section>

                            {supportsRepFeedback && (
                                <div className="border-t border-border pt-6">
                                    <RepFeedbackPanel
                                        feedback={repFeedback}
                                        isLoading={repFeedbackLoading}
                                        repCount={detectedRepCount}
                                        state={repState}
                                        error={repFeedbackError}
                                    />
                                </div>
                            )}

                            {exercise.video_path && (
                                <section className="flex flex-col gap-3 border-t border-border pt-6">
                                    <h3 className="text-base font-semibold text-foreground">Reference video</h3>
                                    <div className="aspect-video overflow-hidden rounded-xl bg-stage">
                                        <video
                                            src={exercise.video_path}
                                            controls
                                            className="h-full w-full object-cover"
                                            preload="metadata"
                                        />
                                    </div>
                                </section>
                            )}
                        </div>

                        <WebcamControls
                            isLoading={isLoading}
                            isRunning={isRunning}
                            isVideoFile={isVideoFile}
                            error={poseError}
                            onStart={start}
                            onStartWithFile={handleStartWithFile}
                            onStop={handleStop}
                        />
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
