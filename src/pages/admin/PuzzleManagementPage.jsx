import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import { api } from '../../services/api';

export default function PuzzleManagementPage() {
  const [puzzles, setPuzzles] = useState([]);
  const [message, setMessage] = useState('');

  const loadPuzzles = async () => {
    const { data } = await api.get('/admin/puzzles');
    setPuzzles(data.puzzles ?? []);
  };

  useEffect(() => {
    loadPuzzles().catch(() => {});
  }, []);

  const persistPuzzle = async (method, url, payload) => {
    setMessage('');
    try {
      await api({ method, url, data: payload });
      setMessage('Puzzle saved successfully.');
      await loadPuzzles();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to save puzzle.');
    }
  };

  return (
    <AdminLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title="Puzzle Management" subtitle="Configure puzzle content, rules, hints, and scoring">
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <SectionCard title="Puzzles by Room" subtitle="Select a room to inspect puzzles">
              <div className="space-y-3">
                {puzzles.map((puzzle) => (
                  <div key={puzzle.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="font-semibold text-white">{puzzle.title}</p>
                    <p className="text-sm text-slate-400">{puzzle.rooms?.title ?? `Room ${puzzle.rooms?.room_number ?? ''}`}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Puzzle Form" subtitle="Admin managed puzzle configuration">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Puzzle Name', 'Create Password'],
                  ['Room', 'Room 1'],
                  ['Puzzle Type', 'password_rule'],
                  ['Base Score', '1000'],
                ].map(([label, value]) => (
                  <label key={label} className="block">
                    <span className="text-sm text-slate-300">{label}</span>
                    <input value={value} readOnly className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                  </label>
                ))}
                <label className="md:col-span-2 block">
                  <span className="text-sm text-slate-300">Question</span>
                  <textarea value="Create a strong password that meets every rule in the checklist." readOnly className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="md:col-span-2 block">
                  <span className="text-sm text-slate-300">Instructions</span>
                  <textarea value="At least 8 characters, uppercase, lowercase, number, and special character." readOnly className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Correct Answer / Validation Rules</span>
                  <input value="Server-side validation only" readOnly className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Hint Penalty</span>
                  <input value="25" readOnly className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Attempt Penalty</span>
                  <input value="50" readOnly className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Order</span>
                  <input value="1" readOnly className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Status</span>
                  <select defaultValue="active" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => persistPuzzle('post', '/admin/puzzles', { room_id: puzzles[0]?.room_id, title: 'New Puzzle', puzzle_type: 'exact', question: 'Sample', instructions: 'Sample', base_score: 1000, attempt_penalty: 50, order_number: 1, status: 'active' })} className="rounded-2xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950">Create Puzzle</button>
                <button type="button" onClick={() => puzzles[0] && persistPuzzle('put', `/admin/puzzles/${puzzles[0].id}`, { title: puzzles[0].title })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Edit Puzzle</button>
                <button type="button" onClick={() => puzzles[0] && persistPuzzle('delete', `/admin/puzzles/${puzzles[0].id}`)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Delete Puzzle</button>
                <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Assign to Room</button>
                <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Configure Rules</button>
                <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Configure Hints</button>
                <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Configure Score</button>
              </div>
              {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}
            </SectionCard>
          </div>
        </DashboardShell>
      )}
    </AdminLayout>
  );
}
