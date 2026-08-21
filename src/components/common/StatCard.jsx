export default function StatCard({ label, value, subtext, accent = 'cyan' }) {
  const accentClasses = {
    cyan: 'from-cyan-400/20 to-cyan-400/5 border-cyan-400/20 text-cyan-200',
    teal: 'from-teal-400/20 to-teal-400/5 border-teal-400/20 text-teal-200',
    blue: 'from-blue-400/20 to-blue-400/5 border-blue-400/20 text-blue-200',
    purple: 'from-purple-400/20 to-purple-400/5 border-purple-400/20 text-purple-200',
    green: 'from-green-400/20 to-green-400/5 border-green-400/20 text-green-200',
    amber: 'from-amber-400/20 to-amber-400/5 border-amber-400/20 text-amber-200',
  };

  return (
    <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-glow ${accentClasses[accent] ?? accentClasses.cyan}`}>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {subtext ? <p className="mt-2 text-sm text-slate-400">{subtext}</p> : null}
    </div>
  );
}
