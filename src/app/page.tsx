import Clock from "@/components/Clock";
import TrainBoard from "@/components/TrainBoard";
import BusBoard from "@/components/BusBoard";
import NoticesPanel from "@/components/NoticesPanel";

export const dynamic = "force-dynamic";

export default function TransitDisplay() {
  return (
    <main className="h-screen w-screen bg-transit-dark p-6 overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-transit-dark via-transit-dark to-[#0d1117] pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 h-full flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-transit-accent to-teal-600 flex items-center justify-center shadow-lg shadow-transit-accent/20">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transit-text tracking-tight">
                22 Southwest St
              </h1>
              <p className="text-sm text-transit-muted">
                Mount Vernon, NY • Transit Information
              </p>
            </div>
          </div>
          
          <Clock />
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* Train Board - Main Panel */}
          <div className="col-span-7 min-h-0">
            <TrainBoard />
          </div>

          {/* Right Side - Bus Board and Notices */}
          <div className="col-span-5 flex flex-col gap-6 min-h-0">
            {/* Bus Board */}
            <div className="flex-1 min-h-0">
              <BusBoard />
            </div>

            {/* Notices Panel */}
            <div className="h-48">
              <NoticesPanel />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between text-xs text-transit-muted">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-transit-accent animate-pulse" />
            <span>Live Data</span>
          </div>
          <div>
            Data provided by MTA • Updates every 60 seconds
          </div>
        </footer>
      </div>
    </main>
  );
}

