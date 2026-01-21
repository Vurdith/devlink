export default function MessagesPage() {
  return (
    <div className="hidden lg:block space-y-6">
      <div className="glass-soft border border-white/10 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-white">Select a conversation</div>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Choose a thread from the left rail or start a new message.
            </p>
          </div>
          <div className="text-[10px] text-white/50 uppercase tracking-[0.2em]">Messaging</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-soft border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
            <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Start fast
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Use the search box to find developers and send a message or request.
          </p>
        </div>
        <div className="glass-soft border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
            <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Requests
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Accept or decline new requests to keep your inbox clean.
          </p>
        </div>
      </div>
    </div>
  );
}
