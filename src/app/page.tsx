import { prisma } from "@/server/db";

export default async function RootPage() {
  // Fetch community stats
  const totalUsers = await prisma.user.count();
  const totalPosts = await prisma.post.count({
    where: { replyToId: null } // Only count main posts, not replies
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mx-auto mb-8">
            <img
              src="/logo/logo.png"
              alt="DevLink"
              className="w-24 h-24 object-contain mx-auto"
            />
          </div>
          <h1 className="text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            What is DevLink?
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The premier professional networking platform for the Roblox development community
          </p>
        </div>

        {/* Mission Statement */}
        <div className="glass rounded-3xl p-12 mb-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
            DevLink connects developers, clients, influencers, and studios in the Roblox ecosystem. 
            We're building the future of collaborative game development by fostering meaningful connections, 
            showcasing talent, and creating opportunities for growth and innovation.
          </p>
        </div>

        {/* What We Do */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="glass rounded-2xl p-8 text-center group hover:bg-white/5 transition-all duration-300">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-4">Developer Showcase</h3>
            <p className="text-gray-300 leading-relaxed">
              Developers can showcase their work, build portfolios, and connect with potential clients and collaborators.
            </p>
          </div>
          
          <div className="glass rounded-2xl p-8 text-center group hover:bg-white/5 transition-all duration-300">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">💼</div>
            <h3 className="text-2xl font-bold text-white mb-4">Client Discovery</h3>
            <p className="text-gray-300 leading-relaxed">
              Clients can discover talented developers, review portfolios, and find the perfect match for their projects.
            </p>
          </div>
          
          <div className="glass rounded-2xl p-8 text-center group hover:bg-white/5 transition-all duration-300">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-4">Community Growth</h3>
            <p className="text-gray-300 leading-relaxed">
              Build your network, share knowledge, and grow together with the Roblox development community.
            </p>
          </div>
        </div>

        {/* Community Stats */}
        <div className="mb-20">
          <div className="glass rounded-2xl p-8 border border-white/10 hover:border-purple-500/20 transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Community Overview</h2>
              <p className="text-gray-400">Join thousands of developers building the future of Roblox</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group text-center">
                <div className="text-5xl font-bold text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                  {totalUsers.toLocaleString()}
                </div>
                <div className="text-gray-300 text-lg font-medium">Members</div>
                <div className="text-sm text-purple-300 mt-1">Active developers</div>
              </div>
              <div className="group text-center">
                <div className="text-5xl font-bold text-pink-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                  {totalPosts.toLocaleString()}
                </div>
                <div className="text-gray-300 text-lg font-medium">Posts</div>
                <div className="text-sm text-pink-300 mt-1">Community updates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Platform Features</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                Professional profiles with portfolio showcases
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                Community feed for sharing work and updates
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                Direct messaging and collaboration tools
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                Project discovery and hiring capabilities
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                Verification system for trusted professionals
              </li>
            </ul>
          </div>
          
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Who Should Join</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                Roblox developers looking to showcase their work
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                Clients seeking talented developers for projects
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                Influencers wanting to promote development services
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                Studios looking to expand their team
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                Anyone passionate about Roblox development
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="glass rounded-3xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of developers, clients, and influencers building the future of Roblox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/register" 
                className="bg-[var(--accent)] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[var(--accent)]/90 transition-colors text-lg"
              >
                Create Account
              </a>
              <a 
                href="/home" 
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors text-lg border border-white/20"
              >
                Explore Feed
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
