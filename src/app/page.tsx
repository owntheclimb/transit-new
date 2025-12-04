import Clock from "@/components/Clock";
import TrainBoard from "@/components/TrainBoard";
import BusBoard from "@/components/BusBoard";
import NoticesPanel from "@/components/NoticesPanel";
import WeatherWidget from "@/components/WeatherWidget";

export const dynamic = "force-dynamic";

export default function TransitDisplay() {
  return (
    <main className="h-screen w-screen bg-[#f8f9fa] p-3 overflow-hidden flex flex-col">
      {/* Header - Compact */}
      <header className="flex items-center justify-between py-2 px-4 card-elevated flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Building Logo */}
          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <span className="text-lg font-bold text-white">22</span>
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)] tracking-tight leading-tight">
              Southwest Street
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">
              Mount Vernon, NY
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <WeatherWidget />
          <div className="h-8 w-px bg-[var(--color-border)]" />
          <Clock />
        </div>
      </header>

      {/* Main Content Grid - 3 Panels */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 mt-3">
        {/* Train Board - Left Panel (larger) */}
        <div className="col-span-5 min-h-0 overflow-hidden">
          <TrainBoard />
        </div>

        {/* Bus Board - Middle Panel */}
        <div className="col-span-4 min-h-0 overflow-hidden">
          <BusBoard />
        </div>

        {/* Notices Panel - Right Panel */}
        <div className="col-span-3 min-h-0 overflow-hidden">
          <NoticesPanel />
        </div>
      </div>

      {/* Footer - Minimal */}
      <footer className="flex-shrink-0 flex items-center justify-between text-[10px] text-[var(--color-text-muted)] py-1.5 px-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">MTA Metro-North • Harlem Line</span>
          <span className="text-[var(--color-border)]">|</span>
          <span className="font-medium">Westchester Bee-Line</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Live data • Auto-refresh 60s</span>
          <span className="text-[var(--color-border)]">|</span>
          <a href="/admin" className="text-[var(--color-accent-blue)] hover:underline font-medium">
            Admin
          </a>
        </div>
      </footer>
    </main>
  );
}
