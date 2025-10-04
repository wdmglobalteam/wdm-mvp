// app/page.tsx
import { HeroSection } from "@/components/HeroSection";
import { RealmsCarousel } from "@/components/RealmsCarousel";
import { ModuleTimeline } from "@/components/ModuleTimeline";
import { WhyWDM } from "@/components/WhyWDM";
import { GamificationProgress } from "@/components/GamificationProgress";
import { Footer } from "@/components/Footer";
import { getServerUser } from '@/lib/supabase/serverSession';

export default async function Home() {
  const user = await getServerUser(); // server fetch
  
  return (
    <div className="min-h-screen bg-[#0a1738] text-white">
      <main className="relative">
        <HeroSection serverUser={user} />
        <RealmsCarousel />
        <ModuleTimeline />
        <WhyWDM />
        <GamificationProgress />
      </main>
      <Footer />
    </div>
  );
}