import Clock from "@/components/Clock";
import TrainBoard from "@/components/TrainBoard";
import BusBoard from "@/components/BusBoard";
import NoticesPanel from "@/components/NoticesPanel";
import WeatherWidget from "@/components/WeatherWidget";

export const dynamic = "force-dynamic";

export default function TransitDisplay() {
  return (
    <main className="h-screen w-screen bg-white p-4 lg:p-6 overflow-hidden">
      <div className="max-w-[1920px] mx-auto h-full flex flex-col gap-3">
        {/* Header */}
        <header className="flex items-center justify-between py-3 px-4 card-elevated">
          <div className="flex items-center gap-4">
            {/* Building Logo */}
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-xl font-bold text-white">22</span>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
                Southwest Street
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] font-medium">
                Mount Vernon, NY
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <WeatherWidget />
            <div className="h-10 w-px bg-[var(--color-border)]" />
            <Clock />
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
          {/* Train Board - Left Panel */}
          <div className="col-span-12 lg:col-span-7 min-h-0 overflow-hidden">
            <TrainBoard />
          </div>

          {/* Right Side - Bus Board */}
          <div className="col-span-12 lg:col-span-5 min-h-0 overflow-hidden">
            <BusBoard />
          </div>
        </div>

        {/* Notices Ticker - Bottom */}
        <div className="flex-shrink-0">
          <NoticesPanel />
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 flex items-center justify-between text-xs text-[var(--color-text-muted)] py-2 px-4">
          <div className="flex items-center gap-3">
            <span className="font-medium">MTA Metro-North • Harlem Line</span>
            <span className="text-[var(--color-border)]">|</span>
            <span className="font-medium">Westchester Bee-Line</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Auto-refresh every 60s</span>
            <span className="text-[var(--color-border)]">|</span>
            <a href="/admin" className="text-[var(--color-accent-blue)] hover:underline font-medium">
              Admin
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
