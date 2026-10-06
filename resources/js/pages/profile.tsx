import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useRef } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile',
        href: edit().url,
    },
];

const appearanceOptions: {
    value: Appearance;
    icon: LucideIcon;
    label: string;
}[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
];

function SavedIndicator({ show }: { show: boolean }) {
    return (
        <Transition
            show={show}
            enter="transition ease-in-out"
            enterFrom="opacity-0"
            leave="transition ease-in-out"
            leaveTo="opacity-0"
        >
            <p className="text-sm text-neutral-600">Saved</p>
        </Transition>
    );
}

function ProfileInformationSection() {
    const { auth } = usePage().props;

    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="Profile information"
                description="Update your name and email address"
            />

            <Form
                {...ProfileController.update.form()}
                options={{
                    preserveScroll: true,
                }}
                className="space-y-6"
            >
                {({ processing, recentlySuccessful, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                defaultValue={auth.user.name}
                                name="name"
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                defaultValue={auth.user.email}
                                name="email"
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.email}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-profile-button"
                            >
                                Save
                            </Button>

                            <SavedIndicator show={recentlySuccessful} />
                        </div>
                    </>
                )}
            </Form>
        </section>
    );
}

function PasswordSection() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="Update password"
                description="Ensure your account is using a long, random password to stay secure"
            />

            <Form
                {...PasswordController.update.form()}
                options={{
                    preserveScroll: true,
                }}
                resetOnError={[
                    'password',
                    'password_confirmation',
                    'current_password',
                ]}
                resetOnSuccess
                onError={(errors) => {
                    if (errors.password) {
                        passwordInput.current?.focus();
                    }

                    if (errors.current_password) {
                        currentPasswordInput.current?.focus();
                    }
                }}
                className="space-y-6"
            >
                {({ errors, processing, recentlySuccessful }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">
                                Current password
                            </Label>

                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                name="current_password"
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                placeholder="Current password"
                            />

                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="new_password">New password</Label>

                            <Input
                                id="new_password"
                                ref={passwordInput}
                                name="password"
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder="New password"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirm password
                            </Label>

                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder="Confirm password"
                            />

                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-password-button"
                            >
                                Save password
                            </Button>

                            <SavedIndicator show={recentlySuccessful} />
                        </div>
                    </>
                )}
            </Form>
        </section>
    );
}

function AppearanceSection() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="Appearance"
                description="Choose between light, dark or system theme"
            />

            <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                {appearanceOptions.map(({ value, icon: Icon, label }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                            appearance === value
                                ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        <Icon className="-ml-1 h-4 w-4" />
                        <span className="ml-1.5 text-sm">{label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}

export default function Profile() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile" />

            <div className="mx-auto max-w-xl space-y-12 px-4 py-6">
                <Heading
                    title="Profile"
                    description="Manage your account and preferences"
                />

                <ProfileInformationSection />

                <DeleteUser />

                <Separator />

                <PasswordSection />

                <Separator />

                <AppearanceSection />
            </div>
        </AppLayout>
    );
}
