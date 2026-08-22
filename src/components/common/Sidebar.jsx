import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ brand, sections, footer }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHashLink = (to) => {
    const [pathname, hash = ''] = to.split('#');
    const nextPath = pathname || location.pathname;

    navigate(
      hash
        ? { pathname: nextPath, hash: `#${hash}` }
        : nextPath,
      { replace: false },
    );

    if (hash) {
      window.requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-slate-950/95 p-4">
      <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">CyberEscape</p>
        <h1 className="mt-2 text-2xl font-black text-white">{brand}</h1>
      </div>
      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
        {sections.map((section, sectionIndex) => (
          <div key={section.title || `section-${sectionIndex}`}>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <NavLink
                  key={`${item.to}-${item.label}-${itemIndex}`}
                  to={item.to}
                  onClick={(event) => {
                    if (item.to.includes('#')) {
                      event.preventDefault();
                      handleHashLink(item.to);
                    }
                  }}
                  className={({ isActive }) =>
                    `block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                      isActive ? 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                  end={item.end}
                >
                  <span className="flex items-center gap-3">
                    {item.icon ? <item.icon className="h-4 w-4 shrink-0" /> : null}
                    <span>{item.label}</span>
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      {footer ? <div className="pt-4">{footer}</div> : null}
    </aside>
  );
}
