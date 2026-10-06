<?php

declare(strict_types=1);

namespace App\Prompts;

use App\Data\Coaching\RepSummaryData;
use App\Models\Exercise;
use Stringable;

/**
 * @phpstan-import-type RepKeyframe from RepSummaryData
 */
final readonly class RepFeedbackPrompt implements Stringable
{
    private const EVALUATED_JOINTS = ['knee', 'hip'];

    /**
     * @param  array<string, mixed>  $reference
     */
    public function __construct(
        private Exercise $exercise,
        private array $reference,
        private RepSummaryData $rep,
    ) {}

    public function __toString(): string
    {
        /** @var list<string> $rawMuscleTypes */
        $rawMuscleTypes = $this->exercise->muscle_types;
        $muscleTypes = implode(', ', $rawMuscleTypes);
        $standingReference = $this->jointReference('standing');
        $bottomReference = $this->jointReference('bottom');
        $tempoReference = json_encode($this->reference['tempo'], JSON_THROW_ON_ERROR);
        $start = $this->describeKeyframe($this->rep->keyframes['start']);
        $end = $this->describeKeyframe($this->rep->keyframes['end']);
        $bottom = $this->describeKeyframe($this->rep->keyframes['bottom']);

        return <<<PROMPT
            You are a professional fitness coach AI. A user has just completed one repetition. Evaluate their form by comparing the measured data with the reference.

            Exercise: {$this->exercise->name}
            Instructions: {$this->exercise->instructions}
            Target muscles: {$muscleTypes}
            Repetition number: {$this->rep->repNumber}

            Data format:
            - Angles are in degrees, measured by MediaPipe Pose (knee = hip-knee-ankle, hip = shoulder-hip-knee, averaged over left and right side).
            - Points are [x, y, z, visibility]. x and y are normalized to the frame size ({$this->rep->frameWidth}x{$this->rep->frameHeight} px), y grows downwards, z is depth relative to the hips (smaller = closer to the camera).

            Section startPosition (judge ONLY from these two standing frames):
            - Reference standing angles (min/ideal/max): {$standingReference}
            - Standing frame before the repetition: {$start}
            - Standing frame after the repetition: {$end}

            Section bottomPosition (judge ONLY from this frame):
            - Reference bottom angles (min/ideal/max): {$bottomReference}
            - Deepest frame of the repetition: {$bottom}

            Section tempo (judge ONLY from these durations):
            - Reference durations in seconds: {$tempoReference}
            - Measured: eccentric (lowering) = {$this->rep->eccentricSeconds} s, concentric (rising) = {$this->rep->concentricSeconds} s

            Rules:
            - Decide each section independently using only its own data. Never judge depth from a standing frame and never judge lockout from the deepest frame.
            - status is "ok" or "warning". Use "warning" only when the data clearly shows a problem.
            - issue must be one of: startPosition -> "incomplete_lockout"; bottomPosition -> "too_shallow", "too_deep"; tempo -> "too_fast", "too_slow". Use null when status is "ok".
            - correction: for "ok" a short praise, for "warning" a concrete correction of that issue. Answer in Czech, at most one sentence per section.

            Respond ONLY with a JSON object in this exact format (no markdown, no code fences):
            {
                "startPosition": {"status": "ok", "issue": null, "correction": "..."},
                "bottomPosition": {"status": "ok", "issue": null, "correction": "..."},
                "tempo": {"status": "ok", "issue": null, "correction": "..."},
                "encouragement": "A short motivational message in Czech"
            }
            PROMPT;
    }

    private function jointReference(string $phase): string
    {
        /** @var array<string, array<string, float|int>> $joints */
        $joints = $this->reference['phases'][$phase];

        return json_encode(array_intersect_key($joints, array_flip(self::EVALUATED_JOINTS)), JSON_THROW_ON_ERROR);
    }

    /**
     * @param  RepKeyframe  $keyframe
     */
    private function describeKeyframe(array $keyframe): string
    {
        $angles = json_encode($keyframe['angles'], JSON_THROW_ON_ERROR);
        $points = json_encode($keyframe['points'], JSON_THROW_ON_ERROR);

        return "angles={$angles}, points={$points}";
    }
}
