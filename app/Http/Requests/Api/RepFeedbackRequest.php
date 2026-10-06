<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use App\Data\Coaching\RepSummaryData;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @phpstan-import-type RepKeyframe from RepSummaryData
 */
final class RepFeedbackRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $points = implode(',', RepSummaryData::KEY_POINTS);
        $keyframes = implode(',', RepSummaryData::KEYFRAMES);

        $rules = [
            'repNumber' => ['required', 'integer', 'min:1'],
            'eccentricSeconds' => ['required', 'numeric', 'between:0,30'],
            'concentricSeconds' => ['required', 'numeric', 'between:0,30'],
            'frame' => ['required', 'array:width,height', 'required_array_keys:width,height'],
            'frame.width' => ['required', 'integer', 'between:1,10000'],
            'frame.height' => ['required', 'integer', 'between:1,10000'],
            'keyframes' => ['required', "array:{$keyframes}", "required_array_keys:{$keyframes}"],
        ];

        foreach (RepSummaryData::KEYFRAMES as $keyframe) {
            $prefix = "keyframes.{$keyframe}";

            $rules[$prefix] = ['required', 'array:angles,points', 'required_array_keys:angles,points'];
            $rules["{$prefix}.angles"] = ['required', 'array:knee,hip', 'required_array_keys:knee,hip'];
            $rules["{$prefix}.angles.knee"] = ['required', 'numeric', 'between:0,180'];
            $rules["{$prefix}.angles.hip"] = ['required', 'numeric', 'between:0,180'];
            $rules["{$prefix}.points"] = ['required', "array:{$points}", "required_array_keys:{$points}"];

            foreach (RepSummaryData::KEY_POINTS as $point) {
                $rules["{$prefix}.points.{$point}"] = ['required', 'list', 'size:4'];
                $rules["{$prefix}.points.{$point}.*"] = ['required', 'numeric', 'between:-10,10'];
            }
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'repNumber.required' => 'Číslo opakování je povinné.',
            'repNumber.integer' => 'Číslo opakování musí být celé číslo.',
            'repNumber.min' => 'Číslo opakování musí být alespoň :min.',
            'eccentricSeconds.required' => 'Doba spouštění je povinná.',
            'eccentricSeconds.numeric' => 'Doba spouštění musí být číslo.',
            'eccentricSeconds.between' => 'Doba spouštění musí být mezi :min a :max sekundami.',
            'concentricSeconds.required' => 'Doba zvedání je povinná.',
            'concentricSeconds.numeric' => 'Doba zvedání musí být číslo.',
            'concentricSeconds.between' => 'Doba zvedání musí být mezi :min a :max sekundami.',
            'frame.*' => 'Rozměry snímku musí obsahovat šířku a výšku v pixelech.',
            'frame.*.*' => 'Rozměr snímku (:attribute) musí být celé číslo mezi :min a :max.',
            'keyframes.required' => 'Klíčové snímky opakování jsou povinné.',
            'keyframes.array' => 'Klíčové snímky smí být jen start, bottom a end.',
            'keyframes.required_array_keys' => 'Chybí některý klíčový snímek (start, bottom, end).',
            'keyframes.*.required' => 'Klíčový snímek (:attribute) je povinný.',
            'keyframes.*.array' => 'Klíčový snímek (:attribute) smí obsahovat jen angles a points.',
            'keyframes.*.required_array_keys' => 'Klíčový snímek (:attribute) musí obsahovat angles i points.',
            'keyframes.*.angles.array' => 'Úhly (:attribute) smí obsahovat jen klíče knee a hip.',
            'keyframes.*.angles.required_array_keys' => 'Úhly (:attribute) musí obsahovat klíče knee i hip.',
            'keyframes.*.angles.*.numeric' => 'Úhel (:attribute) musí být číslo.',
            'keyframes.*.angles.*.between' => 'Úhel (:attribute) musí být mezi :min a :max stupni.',
            'keyframes.*.points.array' => 'Body (:attribute) obsahují nepovolený kloub.',
            'keyframes.*.points.required_array_keys' => 'Body (:attribute) musí obsahovat všechny sledované klouby.',
            'keyframes.*.points.*.list' => 'Bod (:attribute) musí být seznam [x, y, z, viditelnost].',
            'keyframes.*.points.*.size' => 'Bod (:attribute) musí mít přesně :size hodnoty.',
            'keyframes.*.points.*.*.numeric' => 'Souřadnice bodu (:attribute) musí být číslo.',
            'keyframes.*.points.*.*.between' => 'Souřadnice bodu (:attribute) musí být mezi :min a :max.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'repNumber' => 'číslo opakování',
            'eccentricSeconds' => 'doba spouštění',
            'concentricSeconds' => 'doba zvedání',
            'frame.width' => 'šířka',
            'frame.height' => 'výška',
            'keyframes.start' => 'výchozí pozice',
            'keyframes.bottom' => 'bod obratu',
            'keyframes.end' => 'koncová pozice',
        ];
    }

    public function toRepSummary(): RepSummaryData
    {
        $validated = $this->validated();

        /** @var array{start: RepKeyframe, bottom: RepKeyframe, end: RepKeyframe} $keyframes */
        $keyframes = [];

        foreach (RepSummaryData::KEYFRAMES as $keyframe) {
            $keyframes[$keyframe] = $this->keyframeFrom($validated['keyframes'][$keyframe]);
        }

        return new RepSummaryData(
            repNumber: (int) $validated['repNumber'],
            keyframes: $keyframes,
            frameWidth: (int) $validated['frame']['width'],
            frameHeight: (int) $validated['frame']['height'],
            eccentricSeconds: (float) $validated['eccentricSeconds'],
            concentricSeconds: (float) $validated['concentricSeconds'],
        );
    }

    /**
     * @param  array{angles: array{knee: mixed, hip: mixed}, points: array<string, list<mixed>>}  $keyframe
     *
     * @return RepKeyframe
     */
    private function keyframeFrom(array $keyframe): array
    {
        $points = [];

        foreach (RepSummaryData::KEY_POINTS as $point) {
            [$x, $y, $z, $visibility] = $keyframe['points'][$point];
            $points[$point] = [(float) $x, (float) $y, (float) $z, (float) $visibility];
        }

        return [
            'angles' => [
                'knee' => (float) $keyframe['angles']['knee'],
                'hip' => (float) $keyframe['angles']['hip'],
            ],
            'points' => $points,
        ];
    }
}
