import { useEffect, useRef } from 'react';
import PoseOverlay from '@/components/coaching/pose-overlay';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { JointDeviation, Point3D } from '@/types';

export const VIDEO_WIDTH = 640;

export type CalibrationOverlayState = 'idle' | 'calibrating' | 'failed';

export default function WebcamView({
    videoRef,
    canvasRef,
    gifCanvasRef,
    landmarks,
    deviations,
    isLoading,
    isRunning,
    isVideoFile,
    isGif,
    mediaAspectRatio,
    calibrationState = 'idle',
    className,
}: {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    gifCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    landmarks: Point3D[] | null;
    deviations: JointDeviation[];
    isLoading: boolean;
    isRunning: boolean;
    isVideoFile: boolean;
    isGif: boolean;
    mediaAspectRatio: number;
    calibrationState?: CalibrationOverlayState;
    className?: string;
}) {
    return (
        <div
            className={cn('relative flex items-center justify-center overflow-hidden rounded-2xl bg-stage', className)}
            style={{ containerType: 'size' }}
        >
            {/* Largest box with the media aspect ratio that fits the stage, so the pose overlay stays aligned with the video. */}
            <div
                className="relative"
                style={{
                    aspectRatio: mediaAspectRatio,
                    width: `min(100cqw, calc(100cqh * ${mediaAspectRatio}))`,
                }}
            >
                <video
                    ref={videoRef}
                    className={isGif ? 'hidden' : 'h-full w-full object-contain'}
                    playsInline
                    muted
                    style={isVideoFile ? undefined : { transform: 'scaleX(-1)' }}
                />
                <canvas ref={gifCanvasRef} className={isGif ? 'h-full w-full object-contain' : 'hidden'} />

                <PoseOverlay
                    landmarks={landmarks}
                    deviations={deviations}
                    width={VIDEO_WIDTH}
                    height={Math.round(VIDEO_WIDTH / mediaAspectRatio)}
                    canvasRef={canvasRef}
                    isMirrored={!isVideoFile}
                />
            </div>

            {!isRunning && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
                    <p className="text-sm font-medium text-foreground">Camera is off</p>
                    <p className="text-xs text-muted-foreground">Stand side-on, whole body in frame</p>
                </div>
            )}

            {isRunning && calibrationState !== 'idle' && (
                <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
                    <div
                        role="status"
                        className={cn(
                            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white backdrop-blur-sm',
                            calibrationState === 'failed' ? 'bg-destructive/80' : 'bg-black/60',
                        )}
                    >
                        {calibrationState === 'calibrating' && <Spinner className="size-4" />}
                        {calibrationState === 'calibrating'
                            ? 'Kalibruji postoj — stůj vzpřímeně'
                            : 'Nelze zachytit postoj — stůj chvíli klidně'}
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="flex items-center gap-2 text-white">
                        <Spinner className="size-5" />
                        <span className="text-sm">Loading pose model...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function Kbd({ children }: { children: string }) {
    return (
        <kbd className="inline-flex size-6 items-center justify-center rounded-md bg-current/15 font-sans text-xs font-medium">
            {children}
        </kbd>
    );
}

function isTypingTarget(target: EventTarget | null): boolean {
    return (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
    );
}

export function WebcamControls({
    isLoading,
    isRunning,
    isVideoFile,
    error,
    canStart,
    onStart,
    onStartWithFile,
    onStop,
}: {
    isLoading: boolean;
    isRunning: boolean;
    isVideoFile: boolean;
    error: string | null;
    canStart: boolean;
    onStart: () => void;
    onStartWithFile: (file: File) => void;
    onStop: () => void;
}) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const isCameraRunning = isRunning && !isVideoFile;
    const isFileRunning = isRunning && isVideoFile;

    const toggleCamera = isCameraRunning ? onStop : onStart;
    const toggleFile = isFileRunning ? onStop : () => fileInputRef.current?.click();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isLoading || event.repeat || event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === 'c') {
                if (isCameraRunning) {
                    onStop();
                } else if (canStart) {
                    onStart();
                }
            } else if (key === 'v') {
                if (isFileRunning) {
                    onStop();
                } else if (canStart) {
                    fileInputRef.current?.click();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLoading, isCameraRunning, isFileRunning, canStart, onStart, onStop]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onStartWithFile(file);
        }
        e.target.value = '';
    };

    return (
        <div className="flex flex-col gap-2">
            {error && <p className="text-sm text-destructive">{error}</p>}

            <input ref={fileInputRef} type="file" accept="video/*,image/gif" className="hidden" onChange={handleFileChange} />

            <button
                type="button"
                onClick={toggleCamera}
                disabled={isLoading || (!isCameraRunning && !canStart)}
                aria-keyshortcuts="C"
                className={cn(
                    'inline-flex h-11 items-center justify-center gap-3 rounded-full text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                    isCameraRunning
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        : 'bg-foreground text-background hover:bg-foreground/90',
                )}
            >
                {isCameraRunning ? 'Stop camera' : 'Start camera'}
                <Kbd>C</Kbd>
            </button>

            <button
                type="button"
                onClick={toggleFile}
                disabled={isLoading || (!isFileRunning && !canStart)}
                aria-keyshortcuts="V"
                className={cn(
                    'inline-flex h-11 items-center justify-center gap-3 rounded-full border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                    isFileRunning
                        ? 'border-destructive text-destructive hover:bg-destructive/10'
                        : 'border-border text-foreground hover:bg-muted',
                )}
            >
                {isFileRunning ? 'Stop video' : 'Upload video'}
                <Kbd>V</Kbd>
            </button>
        </div>
    );
}
