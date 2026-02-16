import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dumbbell, Search, ArrowRight } from 'lucide-react';
import ExerciseShowController from '@/actions/App/Http/Controllers/ExerciseShowController';
import { dashboard, exercises } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

type Exercise = {
    id: number;
    name: string;
    description: string;
    ppl_type: string | null;
    ul_type: string | null;
    muscle_types: string[];
};

const PPL_COLORS: Record<string, string> = {
    Push: 'border-l-emerald-500',
    Pull: 'border-l-sky-500',
    Legs: 'border-l-amber-500',
};

const PPL_BADGE_COLORS: Record<string, string> = {
    Push: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Pull: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    Legs: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

const PPL_AVATAR_COLORS: Record<string, string> = {
    Push: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    Pull: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    Legs: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Exercises', href: exercises().url },
];

const FILTERS = ['All', 'Push', 'Pull', 'Legs'] as const;

export default function ExercisesIndex({ exercises: exerciseList }: { exercises: Exercise[] }) {
    const [activeFilter, setActiveFilter] = useState<string>('All');

    const filteredExercises =
        activeFilter === 'All' ? exerciseList : exerciseList.filter((e) => e.ppl_type === activeFilter);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exercises" />

            <div className="flex flex-col gap-6 p-4 pb-8">
                {/* Page Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Exercises</h1>
                    <p className="text-sm text-muted-foreground">
                        Browse and select an exercise to start training with AI feedback.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto flex-nowrap">
                        {FILTERS.map((filter) => (
                            <Button
                                key={filter}
                                variant={activeFilter === filter ? 'default' : 'outline'}
                                size="sm"
                                className={activeFilter === filter ? 'font-medium' : 'text-muted-foreground'}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </Button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Search className="h-4 w-4" />
                        <span>
                            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <Separator />

                {/* Exercise Grid */}
                {filteredExercises.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredExercises.map((exercise) => {
                            const borderColor =
                                exercise.ppl_type && PPL_COLORS[exercise.ppl_type]
                                    ? PPL_COLORS[exercise.ppl_type]
                                    : 'border-l-primary';
                            const avatarColor =
                                exercise.ppl_type && PPL_AVATAR_COLORS[exercise.ppl_type]
                                    ? PPL_AVATAR_COLORS[exercise.ppl_type]
                                    : 'bg-primary/15 text-primary';

                            return (
                                <Link
                                    key={exercise.id}
                                    href={ExerciseShowController.url(exercise.id)}
                                    className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <Card
                                        className={`h-full border-l-4 ${borderColor}`}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                                                    <AvatarFallback
                                                        className={`rounded-lg text-sm font-bold ${avatarColor}`}
                                                    >
                                                        {exercise.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex min-w-0 flex-col gap-1">
                                                    <CardTitle className="text-base font-semibold leading-tight text-foreground transition-colors duration-200 group-hover:text-primary">
                                                        {exercise.name}
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                                                        {exercise.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex flex-wrap gap-1.5">
                                                {exercise.ppl_type && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs font-medium ${PPL_BADGE_COLORS[exercise.ppl_type] ?? ''}`}
                                                    >
                                                        {exercise.ppl_type}
                                                    </Badge>
                                                )}
                                                {exercise.ul_type && (
                                                    <Badge variant="outline" className="text-xs font-medium">
                                                        {exercise.ul_type}
                                                    </Badge>
                                                )}
                                                {exercise.muscle_types.map((muscle) => (
                                                    <Badge key={muscle} variant="secondary" className="text-xs">
                                                        {muscle}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                <span>View exercise</span>
                                                <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                                <Dumbbell className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className="text-lg font-semibold text-foreground">No exercises found</h3>
                                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                                    There are no exercises matching your current filter. Try a different category.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setActiveFilter('All')}>
                                Clear filters
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
