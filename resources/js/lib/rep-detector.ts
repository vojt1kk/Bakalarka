import type { JointAngles, KeyPoints, RepAngles, RepDetectorState, RepKeyframe, RepSummary } from '@/types/coaching';

const STANDING_TOLERANCE_DEG = 20;
const DESCENT_DROP_DEG = 35;
const MOVEMENT_DEG = 10;
const HOLD_MS = 500;
const SETTLE_MS = 300;
const MIN_REP_MS = 400;
const REVERSAL_DEG = 10;
const REVERSAL_HOLD_MS = 120;
const CALIBRATION_MIN_MS = 800;
const CALIBRATION_STABILITY_DEG = 15;
const CALIBRATION_MIN_EXTENSION_DEG = 120;
const CALIBRATION_TIMEOUT_MS = 3000;
const CALIBRATION_MIN_SAMPLES = 10;

export type RepDetector = {
    update: (angles: JointAngles, timestampMs: number, points: KeyPoints) => RepSummary | null;
    reset: () => void;
    getState: () => RepDetectorState;
    getCompletedReps: () => number;
    getBaseline: () => number | null;
    isReady: () => boolean;
    flush: () => RepSummary | null;
};

type Sample = {
    angles: RepAngles;
    points: KeyPoints;
    value: number;
    timestampMs: number;
};

type PendingRep = {
    summary: RepSummary;
    end: Sample;
    returnedAt: number;
};

/**
 * Mean of knee and hip angle. Camera-angle agnostic: front-view knee readings alone are too noisy.
 */
function extension(angles: RepAngles): number {
    return (angles.knee + angles.hip) / 2;
}

function readAngles(angles: JointAngles): RepAngles | null {
    const { knee, hip } = angles;

    return knee === undefined || hip === undefined ? null : { knee, hip };
}

function higher(current: Sample | null, candidate: Sample): Sample {
    return current === null || candidate.value > current.value ? candidate : current;
}

function round(value: number, decimals: number): number {
    const factor = 10 ** decimals;

    return Math.round(value * factor) / factor;
}

function percentile(sorted: number[], ratio: number): number {
    const index = (sorted.length - 1) * ratio;
    const lower = Math.floor(index);
    const upper = Math.min(lower + 1, sorted.length - 1);

    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function toKeyframe(sample: Sample): RepKeyframe {
    return {
        angles: { knee: round(sample.angles.knee, 1), hip: round(sample.angles.hip, 1) },
        points: sample.points,
    };
}

/**
 * Rep state machine driven by the knee/hip extension signal. Each keyframe in the summary is one real frame,
 * so its angles and points always belong together.
 *
 * The detector starts in `calibrating`: the standing baseline is fixed once from the median of a stable upright window
 * and never changes afterwards, so a person who starts mid-movement cannot inflate it and lose the first rep.
 * If no stable window is found within the timeout the state becomes `calibration_failed`, which stops counting
 * but keeps looking for a stable window so the user can recover by standing still.
 */
export function createRepDetector(): RepDetector {
    let state: RepDetectorState = 'calibrating';
    let repNumber = 0;
    let baseline: number | null = null;
    let startPeak: Sample | null = null;
    let lastStandingAt = 0;
    let leftStartAt = 0;
    let bottom: Sample | null = null;
    let reversalStart: number | null = null;
    let holdStart: number | null = null;
    let holdPeak: Sample | null = null;
    let ascentPeak: Sample | null = null;
    let pending: PendingRep | null = null;
    let calibrationStartedAt: number | null = null;
    let calibrationSamples: Sample[] = [];

    function isStanding(value: number): boolean {
        return baseline !== null && value >= baseline - STANDING_TOLERANCE_DEG;
    }

    function returnToStart(peak: Sample | null, timestampMs: number): void {
        state = 'start';
        startPeak = peak;
        lastStandingAt = timestampMs;
        holdStart = null;
        holdPeak = null;
        reversalStart = null;
    }

    function updateCalibrating(sample: Sample): void {
        calibrationStartedAt ??= sample.timestampMs;

        if (state === 'calibrating' && sample.timestampMs - calibrationStartedAt > CALIBRATION_TIMEOUT_MS) {
            state = 'calibration_failed';
        }

        calibrationSamples.push(sample);

        // Keep one anchor sample at or before the window start so the window can span the full duration.
        const windowStart = sample.timestampMs - CALIBRATION_MIN_MS;
        while (calibrationSamples.length > 1 && calibrationSamples[1].timestampMs <= windowStart) {
            calibrationSamples.shift();
        }

        if (
            calibrationSamples.length < CALIBRATION_MIN_SAMPLES ||
            sample.timestampMs - calibrationSamples[0].timestampMs < CALIBRATION_MIN_MS
        ) {
            return;
        }

        const sorted = calibrationSamples.map((calibrationSample) => calibrationSample.value).sort((a, b) => a - b);
        const median = percentile(sorted, 0.5);

        // The 10th–90th percentile spread ignores single-frame landmark spikes; the median floor rejects a held squat.
        if (
            percentile(sorted, 0.9) - percentile(sorted, 0.1) > CALIBRATION_STABILITY_DEG ||
            median < CALIBRATION_MIN_EXTENSION_DEG
        ) {
            return;
        }

        baseline = median;
        startPeak = sample;
        lastStandingAt = sample.timestampMs;
        state = 'start';
        calibrationSamples = [];
        calibrationStartedAt = null;
    }

    function beginDescent(sample: Sample): void {
        state = 'descending';
        leftStartAt = lastStandingAt;
        bottom = sample;
        ascentPeak = null;
        reversalStart = null;
        holdStart = null;
        holdPeak = null;
    }

    function trackHold(sample: Sample): boolean {
        if (holdStart === null) {
            holdStart = sample.timestampMs;
        }
        holdPeak = higher(holdPeak, sample);

        return sample.timestampMs - holdStart >= HOLD_MS;
    }

    function flushPending(): RepSummary | null {
        if (pending === null) {
            return null;
        }

        const summary: RepSummary = {
            ...pending.summary,
            keyframes: { ...pending.summary.keyframes, end: toKeyframe(pending.end) },
        };
        pending = null;

        return summary;
    }

    function finishRep(end: Sample, returnedAt: number, settle: boolean): RepSummary | null {
        const rep: RepSummary | null =
            startPeak !== null && bottom !== null && returnedAt - leftStartAt >= MIN_REP_MS
                ? {
                      repNumber: repNumber + 1,
                      keyframes: { start: toKeyframe(startPeak), bottom: toKeyframe(bottom), end: toKeyframe(end) },
                      eccentricSeconds: round((bottom.timestampMs - leftStartAt) / 1000, 2),
                      concentricSeconds: round((returnedAt - bottom.timestampMs) / 1000, 2),
                  }
                : null;

        if (rep !== null) {
            repNumber++;
        }
        returnToStart(end, returnedAt);

        if (rep !== null && settle) {
            pending = { summary: rep, end, returnedAt };

            return null;
        }

        return rep;
    }

    function updateStart(sample: Sample): RepSummary | null {
        const { value, timestampMs } = sample;
        let settled: RepSummary | null = null;

        if (pending !== null) {
            if (isStanding(value)) {
                pending.end = higher(pending.end, sample);
            }
            if (timestampMs - pending.returnedAt >= SETTLE_MS) {
                settled = flushPending();
            }
        }

        if (baseline === null) {
            return settled;
        }

        if (isStanding(value)) {
            startPeak = higher(startPeak, sample);
        }

        if (value >= baseline - MOVEMENT_DEG) {
            lastStandingAt = timestampMs;
        }

        if (value < baseline - DESCENT_DROP_DEG) {
            settled ??= flushPending();
            beginDescent(sample);
        }

        return settled;
    }

    function updateAscending(sample: Sample): RepSummary | null {
        const { value } = sample;
        ascentPeak = higher(ascentPeak, sample);

        if (baseline !== null && value >= baseline - MOVEMENT_DEG) {
            return finishRep(sample, sample.timestampMs, true);
        }

        if (isStanding(value)) {
            return trackHold(sample) && holdStart !== null && holdPeak !== null
                ? finishRep(holdPeak, holdStart, false)
                : null;
        }

        holdStart = null;
        holdPeak = null;

        if (isStanding(ascentPeak.value) && value < ascentPeak.value - DESCENT_DROP_DEG) {
            const peak = ascentPeak;
            const rep = finishRep(peak, peak.timestampMs, false);
            beginDescent(sample);

            return rep;
        }

        if (bottom !== null && value < bottom.value) {
            state = 'bottom';
            reversalStart = null;
            bottom = sample;
        }

        return null;
    }

    function updateLowering(sample: Sample): void {
        const { value, timestampMs } = sample;

        if (state === 'descending' && isStanding(value)) {
            if (trackHold(sample)) {
                returnToStart(holdPeak, timestampMs);
            }

            return;
        }
        holdStart = null;
        holdPeak = null;

        if (bottom === null || value < bottom.value) {
            bottom = sample;
        }

        if (value - bottom.value > REVERSAL_DEG) {
            reversalStart ??= timestampMs;
            state = 'bottom';
        } else {
            reversalStart = null;
            state = 'descending';
        }

        if (reversalStart !== null && timestampMs - reversalStart >= REVERSAL_HOLD_MS) {
            state = 'ascending';
        }
    }

    function update(angles: JointAngles, timestampMs: number, points: KeyPoints): RepSummary | null {
        const repAngles = readAngles(angles);

        if (repAngles === null) {
            return null;
        }

        const sample: Sample = { angles: repAngles, points, value: extension(repAngles), timestampMs };

        if (state === 'calibrating' || state === 'calibration_failed') {
            updateCalibrating(sample);

            return null;
        }

        if (state === 'start') {
            return updateStart(sample);
        }

        if (state === 'ascending') {
            return updateAscending(sample);
        }

        updateLowering(sample);

        return null;
    }

    function reset(): void {
        state = 'calibrating';
        repNumber = 0;
        baseline = null;
        startPeak = null;
        lastStandingAt = 0;
        leftStartAt = 0;
        bottom = null;
        reversalStart = null;
        holdStart = null;
        holdPeak = null;
        ascentPeak = null;
        pending = null;
        calibrationStartedAt = null;
        calibrationSamples = [];
    }

    return {
        update,
        reset,
        getState: () => state,
        getCompletedReps: () => repNumber,
        getBaseline: () => baseline,
        isReady: () => state !== 'calibrating' && state !== 'calibration_failed',
        flush: flushPending,
    };
}
