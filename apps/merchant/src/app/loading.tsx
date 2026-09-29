export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-surface-elevated"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 rounded-2xl border border-line bg-paper/60"></div>
          <div className="h-32 rounded-2xl border border-line bg-paper/60"></div>
          <div className="h-32 rounded-2xl border border-line bg-paper/60"></div>
          <div className="h-32 rounded-2xl border border-line bg-paper/60"></div>
        </div>
        <div className="h-80 rounded-2xl border border-line bg-paper/60"></div>
      </div>
    </div>
  );
}
