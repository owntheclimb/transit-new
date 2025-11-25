import Clock from "@/components/Clock";
import TrainBoard from "@/components/TrainBoard";
import BusBoard from "@/components/BusBoard";
import NoticesPanel from "@/components/NoticesPanel";

export const dynamic = "force-dynamic";

export default function TransitDisplay() {
  return (
    <main className="h-screen w-screen bg-[#0a0a0f] p-6 overflow-hidden">
      <div className="h-full flex flex-col gap-5">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              22 Southwest Street
            </h1>
            <p className="text-sm text-white/50 mt-0.5">
              Mount Vernon, NY
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/5 rounded-full">
              <div className="live-dot"></div>
              <span className="text-xs font-medium text-white/70 uppercase tracking-wide">Live</span>
            </div>
            <Clock />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-12 gap-5 min-h-0">
          {/* Train Board */}
          <div className="col-span-7 min-h-0">
            <TrainBoard />
          </div>

          {/* Right Side */}
          <div className="col-span-5 flex flex-col gap-5 min-h-0">
            <div className="flex-1 min-h-0">
              <BusBoard />
            </div>
            <div className="h-36">
              <NoticesPanel />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between text-xs text-white/30">
          <div className="flex items-center gap-4">
            <span>Metro-North Railroad</span>
            <span>•</span>
            <span>Bee-Line Bus</span>
          </div>
          <a href="/admin" className="hover:text-white/50 transition-colors">
            Admin
          </a>
        </footer>
      </div>
    </main>
  );
}
