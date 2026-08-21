import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-white">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-slate-400">The requested cyber route was not found.</p>
      <Link className="rounded-2xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950" to="/auth/login">
        Return to Login
      </Link>
    </div>
  );
}
