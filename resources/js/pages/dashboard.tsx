import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dumbbell, Activity, Trophy, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';
import { dashboard, exercises } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ exerciseCount }: { exerciseCount: number }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-8 p-4 pb-8">
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(142_71%_45%/0.08),transparent_60%)]" />
                    <div className="relative flex flex-col gap-6 p-6 sm:p-10 lg:p-12">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                                <Zap className="mr-1 h-3 w-3" />
                                AI-Powered
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
                                Your Personal AI
                                <br />
                                <span className="text-primary">Fitness Coach</span>
                            </h1>
                            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                                Get real-time feedback on your form, track your progress, and train smarter with AI-powered
                                coaching.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button asChild size="lg" className="font-semibold">
                                <Link href={exercises().url}>
                                    Start Training
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href={exercises().url}>Browse Exercises</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
                        <Separator className="flex-1" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card className="group relative overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-150" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Available Exercises
                                </CardTitle>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                    <Dumbbell className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-foreground">{exerciseCount}</span>
                                    <span className="mb-1 text-sm text-muted-foreground">exercises</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Ready to practice with AI feedback</p>
                            </CardContent>
                        </Card>

                        <Card className="group relative overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-accent/50 transition-transform duration-300 group-hover:scale-150" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Last Activity
                                </CardTitle>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                                    <Activity className="h-4 w-4 text-accent-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-foreground">--</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Start your first workout</p>
                            </CardContent>
                        </Card>

                        <Card className="group relative overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-accent/50 transition-transform duration-300 group-hover:scale-150" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Workouts
                                </CardTitle>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                                    <Trophy className="h-4 w-4 text-accent-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-foreground">0</span>
                                    <span className="mb-1 text-sm text-muted-foreground">completed</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Your journey begins now</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Quick Start */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-foreground">Quick Start</h2>
                        <Separator className="flex-1" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Link href={exercises().url}>
                            <Card className="group cursor-pointer border-dashed transition-all duration-200 hover:border-primary/40 hover:bg-accent/50">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-200 group-hover:bg-primary/20">
                                        <Target className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-sm font-semibold text-foreground">Practice an Exercise</h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            Pick an exercise and get real-time form feedback from our AI coach.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href={exercises().url}>
                            <Card className="group cursor-pointer border-dashed transition-all duration-200 hover:border-primary/40 hover:bg-accent/50">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-200 group-hover:bg-primary/20">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-sm font-semibold text-foreground">Review Your Form</h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            Watch reference videos and study proper technique before training.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
