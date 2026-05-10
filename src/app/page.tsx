import { getAuthSession } from "@/server/auth";
import { HeroNetworkBackground } from "@/components/landing/HeroNetworkBackground";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";

export default async function RootPage() {
  const session = await getAuthSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className="relative min-h-screen -my-6 overflow-x-hidden">
      <HeroNetworkBackground />

      <HeroSection isLoggedIn={isLoggedIn} />

      <FeaturesSection />

      <CTASection isLoggedIn={isLoggedIn} />
    </div>
  );
}
