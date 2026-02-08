import { getAuthSession } from "@/server/auth";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";

export default async function RootPage() {
  const session = await getAuthSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen -m-6 overflow-hidden">
      {/* Hero Section */}
      <HeroSection isLoggedIn={isLoggedIn} />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* CTA Section */}
      <CTASection isLoggedIn={isLoggedIn} />
    </div>
  );
}
