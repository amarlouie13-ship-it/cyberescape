import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import { api } from '../../services/api';

export default function RoomManagementPage() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const roomSummary = useMemo(
    () => ({
      title: activeRoom?.title ?? '',
      topic: activeRoom?.topic ?? '',
      difficulty: activeRoom?.difficulty ?? '',
      objective: activeRoom?.objective ?? '',
      scenario: activeRoom?.scenario ?? '',
      instructions: activeRoom?.instructions ?? '',
      order: activeRoom?.room_number ?? '',
    }),
    [activeRoom],
  );

  const loadRooms = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/rooms');
    const list = data.rooms ?? [];
    setRooms(list);
    setActiveRoom(list[0] ?? null);
    setStatus(list[0]?.status ?? 'active');
    setLoading(false);
  };

  useEffect(() => {
    loadRooms().catch(() => setLoading(false));
  }, []);

  const persistRoom = async (method, url, payload) => {
    setMessage('');
    try {
      await api({ method, url, data: payload });
      setMessage('Room saved successfully.');
      await loadRooms();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to save room.');
    }
  };

  return (
    <AdminLayout>
      {({ sidebar, onMenuClick }) => (
        <DashboardShell sidebar={sidebar} onMenuClick={onMenuClick} title="Room Management" subtitle="Create, view, edit, and reorder CyberEscape rooms">
          <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
            <SectionCard title="Rooms" subtitle="Select a room to inspect">
              <div className="space-y-3">
                {loading ? <p className="text-slate-400">Loading rooms...</p> : rooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setActiveRoom(room);
                      setStatus(room.status ?? 'active');
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      activeRoom?.id === room.id
                        ? 'border-cyan-400/40 bg-cyan-400/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{room.title}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{room.difficulty}</span>
                    </div>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Room Form" subtitle="Admin managed room configuration">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Room Number', roomSummary.order],
                  ['Room Name', roomSummary.title],
                  ['Topic', roomSummary.topic],
                  ['Difficulty', roomSummary.difficulty],
                ].map(([label, value]) => (
                  <label key={label} className="block">
                    <span className="text-sm text-slate-300">{label}</span>
                    <input value={value} readOnly className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                  </label>
                ))}
                <label className="md:col-span-2 block">
                  <span className="text-sm text-slate-300">Objective</span>
                  <textarea value={roomSummary.objective} readOnly className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="md:col-span-2 block">
                  <span className="text-sm text-slate-300">Scenario</span>
                  <textarea value={roomSummary.scenario} readOnly className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="md:col-span-2 block">
                  <span className="text-sm text-slate-300">Instructions</span>
                  <textarea value={roomSummary.instructions} readOnly className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Status</span>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Background Image</span>
                  <input placeholder="Upload managed in Phase 9" readOnly className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => persistRoom('post', '/admin/rooms', { ...activeRoom, status })} className="rounded-2xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950">Create Room</button>
                <button type="button" onClick={() => activeRoom && persistRoom('put', `/admin/rooms/${activeRoom.id}`, { ...activeRoom, status })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Edit Room</button>
                <button type="button" onClick={() => activeRoom && persistRoom('put', `/admin/rooms/${activeRoom.id}`, { status: 'active' })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Activate Room</button>
                <button type="button" onClick={() => activeRoom && persistRoom('put', `/admin/rooms/${activeRoom.id}`, { status: 'inactive' })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Deactivate Room</button>
                <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Reorder Room</button>
              </div>
              {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}
            </SectionCard>
          </div>
        </DashboardShell>
      )}
    </AdminLayout>
  );
}
