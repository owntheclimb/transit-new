import Clock from "@/components/Clock";
import TrainBoard from "@/components/TrainBoard";
import BusBoard from "@/components/BusBoard";
import NoticesPanel from "@/components/NoticesPanel";

export const dynamic = "force-dynamic";

export default function TransitDisplay() {
  return (
    <main className="h-screen w-screen bg-[#05080d] p-6 lg:p-8 overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="ambient-glow glow-teal w-[600px] h-[600px] -top-40 -left-40" />
      <div className="ambient-glow glow-blue w-[500px] h-[500px] top-1/2 -right-40" />
      <div className="ambient-glow glow-purple w-[400px] h-[400px] -bottom-20 left-1/3" />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col gap-5">
        {/* Header */}
        <header className="flex items-center justify-between py-1">
          <div className="flex items-center gap-5">
            {/* Logo / Building identity */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <span className="text-2xl font-bold text-white">22</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#05080d] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 animate-pulse" />
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Southwest Street
              </h1>
              <p className="text-base text-slate-400 font-medium mt-0.5">
                Mount Vernon, NY • Transit Hub
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="live-indicator">
              <div className="live-dot" />
              <span className="text-sm">Live</span>
            </div>
            <Clock />
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-12 gap-5 min-h-0">
          {/* Train Board - Main Panel */}
          <div className="col-span-7 min-h-0">
            <TrainBoard />
          </div>

          {/* Right Side - Bus Board and Notices */}
          <div className="col-span-5 flex flex-col gap-5 min-h-0">
            {/* Bus Board */}
            <div className="flex-1 min-h-0">
              <BusBoard />
            </div>

            {/* Notices Panel */}
            <div className="h-40">
              <NoticesPanel />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between text-sm text-slate-400 py-2">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-medium">MTA Metro-North</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-medium">Westchester Bee-Line</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Auto-refresh every 60s</span>
            <span className="text-slate-600">•</span>
            <a href="/admin" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
              Admin Panel
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
