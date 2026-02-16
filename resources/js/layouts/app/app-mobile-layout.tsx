import { BottomTabBar } from '@/components/bottom-tab-bar';
import { MobileHeader } from '@/components/mobile-header';
import type { AppLayoutProps } from '@/types';

export default function AppMobileLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <MobileHeader />
            <main className="flex-1 pb-20">{children}</main>
            <BottomTabBar />
        </div>
    );
}
