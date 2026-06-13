import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Cpu,
  Package,
  RefreshCw,
  Video,
  Wifi,
  WifiOff,
} from "lucide-react";

// Connect to the backend exposed by Docker
const socket = io("http://localhost:3000");

function App() {
  const [lastPiece, setLastPiece] = useState(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalSorted, setTotalSorted] = useState(0);
  const [startTime] = useState(Date.now());
  const [uptime, setUptime] = useState("00:00:00");

  useEffect(() => {
    // Socket.io event listeners
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("nueva_clasificacion", (data) => {
      setLastPiece(data);
      setTotalSorted((prev) => prev + 1);
      setHistory((prev) => [data, ...prev].slice(0, 8)); // Keeping last 8 items
    });

    // Uptime monitor simulation for industrial tracking look
    const interval = setInterval(() => {
      const diff = Date.now() - startTime;
      const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(
        2,
        "0",
      );
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(
        2,
        "0",
      );
      setUptime(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("nueva_clasificacion");
      clearInterval(interval);
    };
  }, [startTime]);

  // Dynamic helper to map color strings to Tailwind background rings/dots
  const getColorClass = (colorName) => {
    const colors = {
      blue: "bg-blue-500 ring-blue-500/20 text-blue-700",
      red: "bg-red-500 ring-red-500/20 text-red-700",
      yellow: "bg-yellow-500 ring-yellow-500/20 text-yellow-600",
    };
    return (
      colors[colorName?.toLowerCase()] ||
      "bg-zinc-400 ring-zinc-500/20 text-zinc-700"
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 antialiased selection:bg-zinc-200">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-zinc-900">
                Smart Sorting System
              </span>
              <span className="ml-2 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-500">
                v1.0 Core
              </span>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors shadow-xs ${
              connected
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {connected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span>System Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-rose-600" />
                <span>System Offline</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Row 1: High-level System KPI Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="shadow-xs border-zinc-200/60 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-500">
                Total Items Processed
              </CardTitle>
              <Package className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {totalSorted}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Live counter session metrics
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-zinc-200/60 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-500">
                System Uptime
              </CardTitle>
              <Activity className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight font-mono text-zinc-800">
                {uptime}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Time since Docker container boot
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-zinc-200/60 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-500">
                Hardware Controller
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                Arduino API
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Polling rate: 115200 baud
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Bento Grid Layout for Vision & History Logs */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Focus Component: Vision Control Feed (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xs border-zinc-200/60 bg-white overflow-hidden">
              <CardHeader className="border-b border-zinc-100/80 bg-zinc-50/50 py-4">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-zinc-500" />
                  <div>
                    <CardTitle className="text-base font-semibold text-zinc-900">
                      Computer Vision Stream
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Real-time camera object processing matrix
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Simulated Aspect-Video Placeholder for Camera Feed */}
                <div className="relative aspect-video w-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>

                  {connected ? (
                    <div className="space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-200 border border-zinc-700/50 shadow-inner">
                        <Video className="h-5 w-5 animate-pulse text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-300">
                          MJPEG Frame Stream Ready
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Awaiting openCV hardware bind on /dev/video0
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      Camera offline. Please wake the Node.js WebSocket engine
                      backend.
                    </p>
                  )}

                  {/* Subtle Industrial Grid Camera Accents */}
                  <div className="absolute top-4 left-4 h-3 w-3 border-t-2 border-l-2 border-zinc-700"></div>
                  <div className="absolute top-4 right-4 h-3 w-3 border-t-2 border-r-2 border-zinc-700"></div>
                  <div className="absolute bottom-4 left-4 h-3 w-3 border-b-2 border-l-2 border-zinc-700"></div>
                  <div className="absolute bottom-4 right-4 h-3 w-3 border-b-2 border-r-2 border-zinc-700"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side Columns: Latest Detection & Live History Stream */}
          <div className="space-y-6">
            {/* Component: Latest Classification State */}
            <Card className="shadow-xs border-zinc-200/60 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-zinc-900">
                  Current Classification
                </CardTitle>
                <CardDescription className="text-xs">
                  Telemetry data from the active conveyor target
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lastPiece ? (
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-zinc-200/40 pb-2">
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Property
                      </span>
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Value
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-500">
                        Color Spectrum
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ring-4 ${getColorClass(lastPiece.color).split(" ")[0]} ${getColorClass(lastPiece.color).split(" ")[1]}`}
                        ></span>
                        <span className="text-sm font-semibold capitalize text-zinc-800">
                          {lastPiece.color}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-500">
                        Geometric Shape
                      </span>
                      <span className="text-sm font-semibold capitalize text-zinc-800">
                        {lastPiece.forma}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-medium text-zinc-400">
                        Captured At
                      </span>
                      <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-md">
                        {lastPiece.timestamp}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-zinc-200 text-center">
                    <p className="text-sm font-medium text-zinc-400">
                      No telemetry recorded yet
                    </p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">
                      Pass an object under the camera to stream live
                      classification events.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Component: Stream Log/History List */}
            <Card className="shadow-xs border-zinc-200/60 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-zinc-900">
                  Activity Log
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time transaction log of sorted inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                    {history.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white p-2.5 transition-all hover:bg-zinc-50/50 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-2 w-2 rounded-full ${getColorClass(item.color).split(" ")[0]}`}
                          ></span>
                          <div>
                            <p className="text-xs font-semibold capitalize text-zinc-800">
                              {item.forma}
                            </p>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-tight">
                              {item.color} profile
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md">
                          {item.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center py-6 text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                    Historical registry empty.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
