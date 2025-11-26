import { prisma } from "@/server/db";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CTASection } from "@/components/landing/CTASection";

export default async function RootPage() {
  // Fetch community stats
  const [totalUsers, totalPosts, totalStudios] = await Promise.all([
    prisma.user.count(),
    prisma.post.count({ where: { replyToId: null } }),
    prisma.profile.count({ where: { profileType: "STUDIO" } }),
  ]);

  return (
    <div className="min-h-screen -m-6 overflow-hidden">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Stats Section */}
      <StatsSection 
        totalUsers={totalUsers}
        totalPosts={totalPosts}
        totalStudios={totalStudios}
      />
      
      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
