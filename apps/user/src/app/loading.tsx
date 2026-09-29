export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl space-y-6 animate-pulse">
        <div className="h-8 w-56 rounded-lg bg-muted"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 rounded-2xl border border-border bg-card/50"></div>
          <div className="h-44 rounded-2xl border border-border bg-card/50"></div>
          <div className="h-44 rounded-2xl border border-border bg-card/50"></div>
        </div>
        <div className="h-72 rounded-2xl border border-border bg-card/50"></div>
      </div>
    </div>
  );
}
