import Clock from "@/components/Clock";
import TrainBoard from "@/components/TrainBoard";
import BusBoard from "@/components/BusBoard";
import NoticesPanel from "@/components/NoticesPanel";

export const dynamic = "force-dynamic";

export default function TransitDisplay() {
  return (
    <main className="h-screen w-screen bg-[#0f0f0f] p-8 overflow-hidden">
      {/* Subtle texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 h-full flex flex-col gap-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1">
                Transit Information
              </span>
              <h1 className="section-title text-4xl text-stone-100">
                22 Southwest Street
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                Mount Vernon, New York
              </p>
            </div>
          </div>
          
          <Clock />
        </header>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-stone-800 to-transparent" />

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
          {/* Train Board - Main Panel */}
          <div className="col-span-7 min-h-0">
            <TrainBoard />
          </div>

          {/* Right Side */}
          <div className="col-span-5 flex flex-col gap-6 min-h-0">
            <div className="flex-1 min-h-0">
              <BusBoard />
            </div>
            <div className="h-40">
              <NoticesPanel />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-900">
          <div className="flex items-center gap-6">
            <span>Metro-North Railroad</span>
            <span className="text-stone-800">•</span>
            <span>Westchester Bee-Line</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Live
            </span>
            <a href="/admin" className="text-stone-600 hover:text-stone-400 transition-colors">
              Manage
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
