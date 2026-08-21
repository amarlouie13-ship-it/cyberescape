export default function SectionCard({ title, subtitle, action, children, className = '', ...props }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur ${className}`} {...props}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
