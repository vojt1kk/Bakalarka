# Project Conventions

## Enums (`app/Enums/`)

- Backed string enums with `declare(strict_types=1)`.
- Keys in PascalCase, values in snake_case.
- No extra methods or interfaces unless needed.

```php
enum MuscleType: string
{
    case LowerBack = 'lower_back';
    case UpperBack = 'upper_back';
}
```

## Models (`app/Models/`)

- `final class` extending `Model` with `HasFactory` trait.
- `#[UseFactory(ModelFactory::class)]` attribute.
- PHPDoc block with `@property-read` for all columns.
- `ATTR_*` public constants for every column name.
- `$fillable` array using `self::ATTR_*` constants (no `$guarded`).
- `casts()` method (not `$casts` property). Single enums cast to `EnumClass::class`, JSON arrays cast to `'array'`.

```php
#[UseFactory(ExerciseFactory::class)]
final class Exercise extends Model
{
    use HasFactory;

    public const ATTR_ID = 'id';
    public const ATTR_NAME = 'name';
    public const ATTR_PPL_TYPE = 'ppl_type';
    public const ATTR_MUSCLE_TYPES = 'muscle_types';

    protected $fillable = [
        self::ATTR_NAME,
        self::ATTR_PPL_TYPE,
        self::ATTR_MUSCLE_TYPES,
    ];

    protected function casts(): array
    {
        return [
            self::ATTR_PPL_TYPE => PplType::class,
            self::ATTR_MUSCLE_TYPES => 'array',
        ];
    }
}
```

## Migrations (`database/migrations/`)

- `declare(strict_types=1)`, anonymous class, only `up()` method.
- Single enums stored as `string()->nullable()`.
- Enum arrays stored as `json()`.

## Factories (`database/factories/`)

- Use `Model::ATTR_*` constants as keys.
- Single enums: `fake()->optional()->randomElement(EnumClass::cases())`.
- Enum arrays: `fake()->randomElements(EnumClass::cases(), fake()->numberBetween(1, 3))`.

## InputData (`app/Data/{Resource}/`)

- `final class` with `private array $attributes = []` via constructor promotion.
- `getAttributes()` returns the raw array for Eloquent `create()`/`update()`.
- Setters accept **primitive types** (`string`, `?string`, `list<string>`), not enum instances.
- Use `Model::ATTR_*` constants as array keys.

```php
final class ExerciseInputData
{
    public function __construct(
        private array $attributes = [],
    ) {}

    public function getAttributes(): array
    {
        return $this->attributes;
    }

    public function setName(string $name): void
    {
        $this->attributes[Exercise::ATTR_NAME] = $name;
    }

    public function setPplType(?string $pplType): void
    {
        $this->attributes[Exercise::ATTR_PPL_TYPE] = $pplType;
    }

    public function setMuscleTypes(array $muscleTypes): void
    {
        $this->attributes[Exercise::ATTR_MUSCLE_TYPES] = $muscleTypes;
    }
}
```

## FormRequests (`app/Http/Requests/Api/`)

- `final class` extending `FormRequest`.
- `rules()` returns array-based rules (not string-based).
- API keys in camelCase (e.g. `videoPath`, `pplType`, `muscleTypes`).
- Single enums validated with `Rule::enum(EnumClass::class)`.
- Enum arrays validated with `'array'` + `'min:1'` on parent, `Rule::enum()` on `.*` items.
- `toInputData()` method converts validated data to InputData. Values passed **directly as primitives** without enum conversion.

```php
public function rules(): array
{
    return [
        'pplType' => ['nullable', 'string', Rule::enum(PplType::class)],
        'muscleTypes' => ['required', 'array', 'min:1'],
        'muscleTypes.*' => ['required', 'string', Rule::enum(MuscleType::class)],
    ];
}

public function toInputData(): ExerciseInputData
{
    $validated = $this->validated();
    $inputData = new ExerciseInputData();

    if (isset($validated['pplType'])) {
        $inputData->setPplType($validated['pplType']);
    }

    if (isset($validated['muscleTypes'])) {
        $inputData->setMuscleTypes($validated['muscleTypes']);
    }

    return $inputData;
}
```

## Actions (`app/Actions/{Resource}/`)

- `final readonly class` with single `execute()` method.
- Wrapped in `DB::transaction()`.
- Create: receives `InputData`, returns `Model`.
- Update: receives `Model` + `InputData`, returns `Model`.
- Delete: receives `Model`, returns `void`.

```php
final readonly class CreateExerciseAction
{
    public function execute(ExerciseInputData $inputData): Exercise
    {
        return DB::transaction(fn (): Exercise => Exercise::query()->create($inputData->getAttributes()));
    }
}
```

## API Resources (`app/Http/Resources/Api/`)

- `final class` extending `JsonResource` with `@mixin Model` PHPDoc.
- `public static $wrap;` (no wrapping).
- Keys in camelCase mapping to snake_case model attributes.

```php
/** @mixin Exercise */
final class ExerciseResource extends JsonResource
{
    public static $wrap;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'videoPath' => $this->video_path,
            'pplType' => $this->ppl_type,
            'muscleTypes' => $this->muscle_types,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
```

## API Controllers (`app/Http/Controllers/Api/`)

- `final readonly class` with `use IsJsonResponse` trait.
- Inject Actions and FormRequests via method parameters.
- `index()` returns `AnonymousResourceCollection` via `Resource::collection()`.
- `show()` returns `Resource` via `Resource::make()`.
- `store()`/`update()` use `$request->toInputData()` passed to Action.
- `destroy()` returns `$this->noContent()`.

## API Structure Tests (`tests/Structure/Api/`)

- `final readonly class` implementing `Arrayable`.
- Returns `list<string>` of camelCase response keys.

## Feature Tests (`tests/Feature/Api/`)

- Organized with `describe()` blocks: Index, Show, Store (with Validation), Update, Delete.
- Use `fake()` helper (not `$this->faker`).
- Enum values in test data: `fake()->randomElement(EnumClass::class)->value`.
- Enum array values: `array_map(fn (EnumClass $e): string => $e->value, $enumArray)`.
- Assert structure with `assertApiStructure(new ResourceApiStructure())`.
- Assert paginated with `assertPaginatedApiCount()` + `assertPaginatedApiStructure()`.
- Chain assertions, use `->json()` for Show, `->json('data')` for Index.
