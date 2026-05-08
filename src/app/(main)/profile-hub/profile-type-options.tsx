export const profileTypes = [
  {
    value: "DEVELOPER",
    label: "Developer",
    description: "Showcase portfolio and projects",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polyline points="16,18 22,12 16,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="8,6 2,12 8,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/50",
    bgColor: "bg-blue-500/10",
  },
  {
    value: "CLIENT",
    label: "Client",
    description: "Hire talent and post jobs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 7h-4V3H8v4H4v14h16V7zM8 21V7h8v14H8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-emerald-500 to-green-500",
    borderColor: "border-emerald-500/50",
    bgColor: "bg-emerald-500/10",
  },
  {
    value: "STUDIO",
    label: "Studio",
    description: "Team profile with members",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-purple-500 to-purple-600",
    borderColor: "border-purple-500/50",
    bgColor: "bg-purple-500/10",
  },
  {
    value: "INFLUENCER",
    label: "Influencer",
    description: "Promote and collaborate",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-rose-500 to-pink-500",
    borderColor: "border-rose-500/50",
    bgColor: "bg-rose-500/10",
  },
  {
    value: "INVESTOR",
    label: "Investor",
    description: "Fund projects and startups",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-amber-500 to-yellow-500",
    borderColor: "border-amber-500/50",
    bgColor: "bg-amber-500/10",
  },
  {
    value: "GUEST",
    label: "Guest",
    description: "Browse and explore",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    gradient: "from-slate-500 to-gray-500",
    borderColor: "border-slate-500/50",
    bgColor: "bg-slate-500/10",
  },
];
