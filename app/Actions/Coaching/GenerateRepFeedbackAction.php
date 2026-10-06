<?php

declare(strict_types=1);

namespace App\Actions\Coaching;

use App\Data\Coaching\RepFeedbackData;
use App\Data\Coaching\RepSummaryData;
use App\Enums\FeedbackStatus;
use App\Exceptions\GeminiException;
use App\Models\Exercise;
use App\Prompts\RepFeedbackPrompt;
use App\Services\Gemini\GeminiService;

final readonly class GenerateRepFeedbackAction
{
    private const ALLOWED_ISSUES = [
        'startPosition' => ['incomplete_lockout'],
        'bottomPosition' => ['too_shallow', 'too_deep'],
        'tempo' => ['too_fast', 'too_slow'],
    ];

    public function __construct(
        private GeminiService $geminiService,
    ) {}

    /**
     * @param  array<string, mixed>  $reference
     */
    public function execute(Exercise $exercise, array $reference, RepSummaryData $rep): RepFeedbackData
    {
        $generated = $this->geminiService->generateJson(
            new RepFeedbackPrompt($exercise, $reference, $rep)
        );

        $encouragement = $generated['encouragement'] ?? null;

        if (! is_string($encouragement) || $encouragement === '') {
            throw new GeminiException('Gemini returned no encouragement.');
        }

        return new RepFeedbackData(
            startPosition: $this->parseSection('startPosition', $generated['startPosition'] ?? null),
            bottomPosition: $this->parseSection('bottomPosition', $generated['bottomPosition'] ?? null),
            tempo: $this->parseSection('tempo', $generated['tempo'] ?? null),
            encouragement: $encouragement,
        );
    }

    /**
     * @return array{status: FeedbackStatus, issue: ?string, correction: string}
     */
    private function parseSection(string $section, mixed $generated): array
    {
        $status = is_array($generated) && is_string($generated['status'] ?? null)
            ? FeedbackStatus::tryFrom($generated['status'])
            : null;

        if ($status === null) {
            throw new GeminiException("Gemini returned no valid status for section {$section}.");
        }

        $issue = $generated['issue'] ?? null;

        $isValidIssue = $status === FeedbackStatus::Warning
            ? is_string($issue) && in_array($issue, self::ALLOWED_ISSUES[$section], true)
            : $issue === null;

        if (! $isValidIssue) {
            throw new GeminiException("Gemini returned an invalid issue for section {$section}.");
        }

        $correction = $generated['correction'] ?? null;

        if (! is_string($correction) || $correction === '') {
            throw new GeminiException("Gemini returned no correction for section {$section}.");
        }

        return [
            'status' => $status,
            'issue' => $issue,
            'correction' => $correction,
        ];
    }
}
