export type JointAngles = Record<string, number>;

export type AngleRange = {
    min: number;
    ideal: number;
    max: number;
};

export type PhaseReference = Record<string, AngleRange>;

export type TempoRange = {
    min: number;
    max: number;
};

export type TempoReference = {
    eccentric: TempoRange;
    concentric: TempoRange;
};

export type ExerciseReference = {
    phases: Record<string, PhaseReference>;
    tempo?: TempoReference;
};

export type ExercisePhase = {
    name: string;
    angles: JointAngles;
};

export type JointDeviation = {
    joint: string;
    actual: number;
    ideal: number;
    deviation: number;
};

export type Point3D = {
    x: number;
    y: number;
    z: number;
    visibility?: number;
};

export type RepAngles = {
    knee: number;
    hip: number;
};

export type KeyPoint = [x: number, y: number, z: number, visibility: number];

export type KeyPoints = Record<string, KeyPoint>;

export type RepKeyframe = {
    angles: RepAngles;
    points: KeyPoints;
};

export type RepSummary = {
    repNumber: number;
    keyframes: {
        start: RepKeyframe;
        bottom: RepKeyframe;
        end: RepKeyframe;
    };
    eccentricSeconds: number;
    concentricSeconds: number;
};

export type FrameSize = {
    width: number;
    height: number;
};

export type RepFeedbackPayload = RepSummary & {
    frame: FrameSize;
};

export type RepSectionFeedback = {
    status: 'ok' | 'warning';
    issue: string | null;
    correction: string;
};

export type RepFeedback = {
    startPosition: RepSectionFeedback;
    bottomPosition: RepSectionFeedback;
    tempo: RepSectionFeedback;
    encouragement: string;
};

export type RepDetectorState = 'start' | 'descending' | 'bottom' | 'ascending';
