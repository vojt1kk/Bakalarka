import { describe, expect, it } from 'vitest';
import { createRepDetector, type RepDetector } from '@/lib/rep-detector';
import { frontViewSquatFrames, idealTwoReps, startsMidDescent, type Frame } from '@/lib/rep-detector.fixtures';
import type { RepSummary } from '@/types/coaching';

function run(detector: RepDetector, frames: Frame[]): RepSummary[] {
    const summaries: RepSummary[] = [];

    for (const frame of frames) {
        const summary = detector.update({ knee: frame.knee, hip: frame.hip }, frame.t, {});
        if (summary !== null) {
            summaries.push(summary);
        }
    }

    const flushed = detector.flush();
    if (flushed !== null) {
        summaries.push(flushed);
    }

    return summaries;
}

function mulberry32(seed: number): () => number {
    let state = seed;

    return () => {
        state += 0x6d2b79f5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function withNoise(frames: Frame[], amplitude: number, seed: number): Frame[] {
    const random = mulberry32(seed);

    return frames.map((frame) => ({
        t: frame.t,
        knee: frame.knee + (random() * 2 - 1) * amplitude,
        hip: frame.hip + (random() * 2 - 1) * amplitude,
    }));
}

function jitter(detector: RepDetector, fromMs: number, frameCount: number): void {
    for (let i = 0; i < frameCount; i++) {
        detector.update({ knee: 140 + Math.sin(i) * 20, hip: 140 + Math.cos(i) * 20 }, fromMs + i * 33, {});
    }
}

describe('createRepDetector', () => {
    it('starts in calibrating state', () => {
        const detector = createRepDetector();

        expect(detector.getState()).toBe('calibrating');
        expect(detector.isReady()).toBe(false);
        expect(detector.getBaseline()).toBeNull();
    });

    it('counts both reps after an ideal standing start', () => {
        const detector = createRepDetector();
        const reps = run(detector, idealTwoReps);

        expect(detector.getCompletedReps()).toBe(2);
        expect(reps.map((rep) => rep.repNumber)).toEqual([1, 2]);
        expect(detector.getBaseline()).toBe(171);
    });

    it('counts both reps when the recording starts mid-movement', () => {
        const detector = createRepDetector();
        const reps = run(detector, startsMidDescent);

        expect(detector.getCompletedReps()).toBe(2);
        expect(reps.map((rep) => rep.repNumber)).toEqual([1, 2]);
    });

    it.each([1, 2, 3])('counts both reps on landmark noise (seed %i)', (seed) => {
        const detector = createRepDetector();
        const reps = run(detector, withNoise(idealTwoReps, 6, seed));

        expect(reps.map((rep) => rep.repNumber)).toEqual([1, 2]);
    });

    it('calibrates on real front-view MediaPipe data that starts at the squat bottom', () => {
        const detector = createRepDetector();
        const reps = run(
            detector,
            frontViewSquatFrames.map(([t, knee, hip]) => ({ t, knee, hip })),
        );

        expect(detector.getBaseline()).toBeGreaterThan(140);
        expect(reps.map((rep) => rep.repNumber)).toEqual([1]);
    });

    it('does not calibrate while the squat bottom is held', () => {
        const detector = createRepDetector();
        run(
            detector,
            Array.from({ length: 60 }, (_, i) => ({ t: i * 33, knee: 70, hip: 75 })),
        );

        expect(detector.getState()).toBe('calibrating');
        expect(detector.getBaseline()).toBeNull();
    });

    it('keeps the baseline immutable after calibration', () => {
        const detector = createRepDetector();
        run(detector, idealTwoReps);
        const baseline = detector.getBaseline();

        detector.update({ knee: 185, hip: 185 }, 10_000, {});

        expect(detector.getBaseline()).toBe(baseline);
    });

    it('fails calibration when no stable window appears before the timeout', () => {
        const detector = createRepDetector();
        jitter(detector, 0, 120);

        expect(detector.getState()).toBe('calibration_failed');
        expect(detector.isReady()).toBe(false);
        expect(detector.getCompletedReps()).toBe(0);
    });

    it('recovers from failed calibration once the person stands still', () => {
        const detector = createRepDetector();
        jitter(detector, 0, 120);
        const reps = run(
            detector,
            idealTwoReps.map((frame) => ({ ...frame, t: frame.t + 120 * 33 })),
        );

        expect(detector.isReady()).toBe(true);
        expect(reps.map((rep) => rep.repNumber)).toEqual([1, 2]);
    });

    it('returns to calibrating on reset', () => {
        const detector = createRepDetector();
        run(detector, idealTwoReps);

        detector.reset();

        expect(detector.getState()).toBe('calibrating');
        expect(detector.getBaseline()).toBeNull();
        expect(detector.getCompletedReps()).toBe(0);
    });
});
