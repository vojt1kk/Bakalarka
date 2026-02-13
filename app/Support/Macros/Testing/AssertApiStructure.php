<?php

declare(strict_types=1);

namespace App\Support\Macros\Testing;

use Closure;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Testing\TestResponse;

/**
 * @mixin TestResponse
 */
final readonly class AssertApiStructure
{
    /**
     * @return Closure(Arrayable|array|null, ?array): TestResponse
     */
    public function __invoke(): Closure
    {
        return function (Arrayable|array $structure, ?array $responseData = null): TestResponse {
            $processArray = function (array $data, callable $convert): array {
                $result = [];

                foreach ($data as $key => $value) {
                    if (is_int($key) && $value instanceof Arrayable) {
                        $result = [...$result, ...$convert($value)];
                    } else {
                        $result[$key] = $convert($value);
                    }
                }

                return $result;
            };

            $convertArrayable = function (mixed $data) use (&$convertArrayable, &$processArray): mixed {
                return match (true) {
                    $data instanceof Arrayable => $convertArrayable($data->toArray()),
                    is_array($data) => $processArray($data, $convertArrayable),
                    default => $data
                };
            };

            return $this->assertJsonStructure($convertArrayable($structure), $responseData);
        };
    }
}
