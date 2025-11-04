"use client";
import { Button } from "@/components/ui/Button";
import { signOut } from "next-auth/react";
import { ProfileTypeCard } from "./_components/ProfileTypeCard";
import AccountLinking from "./_components/AccountLinking";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your profile and account preferences</p>
      </div>

      {/* Profile Type Section */}
      <ProfileTypeCard />
      
      {/* Account Linking Section */}
      <div className="bg-gradient-to-br from-white/5 to-white/3 border border-white/10 rounded-xl p-6 shadow-lg">
        <AccountLinking />
      </div>
      
      {/* Sign Out Section */}
      <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-400">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Sign Out</h3>
              <p className="text-sm text-red-200">End your current session</p>
            </div>
          </div>
          <Button 
            onClick={() => signOut({ callbackUrl: "/" })} 
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 shadow-lg"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
