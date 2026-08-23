import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardShell from '../../components/common/DashboardShell';
import SectionCard from '../../components/common/SectionCard';
import { api } from '../../services/api';

const emptyRoom = {
  id: null,
  room_number: '',
  title: '',
  topic: '',
  difficulty: 'Easy',
  objective: '',
  scenario: '',
  instructions: '',
  time_limit_minutes: 30,
  maximum_attempts: 3,
  hint_limit: 3,
  base_points: 1000,
  unlock_requirement: 'None',
  status: 'draft',
  order_number: '',
};

export default function RoomManagementPage() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [form, setForm] = useState(emptyRoom);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const roomSummary = useMemo(
    () => form,
    [form],
  );

  const loadRooms = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/rooms');
    const list = data.rooms ?? [];
    setRooms(list);
    setActiveRoom((current) => current ?? list[0] ?? null);
    setForm((current) => {
      if (current?.id) {
        const matched = list.find((room) => room.id === current.id);
        return matched ? { ...emptyRoom, ...matched } : current;
      }
      const first = list[0];
      return first ? { ...emptyRoom, ...first } : emptyRoom;
    });
    setLoading(false);
  };

  useEffect(() => {
    loadRooms().catch(() => setLoading(false));
  }, []);

  const persistRoom = async (method, url, payload) => {
    setMessage('');
    try {
      setSaving(true);
      await api({ method, url, data: payload });
      setMessage('Room saved successfully.');
      await loadRooms();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to save room.');
    } finally {
      setSaving(false);
    }
  };

  const selectRoom = (room) => {
    setActiveRoom(room);
    setForm({ ...emptyRoom, ...room });
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const moveRoom = async (direction) => {
    const index = rooms.findIndex((room) => room.id === activeRoom?.id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= rooms.length) return;
    const nextRooms = [...rooms];
    [nextRooms[index], nextRooms[nextIndex]] = [nextRooms[nextIndex], nextRooms[index]];
    await persistRoom('put', '/admin/rooms/reorder', { rooms: nextRooms });
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
                    onClick={() => selectRoom(room)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      activeRoom?.id === room.id
                        ? 'border-cyan-400/40 bg-cyan-400/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{room.display_label ?? `${String(room.room_number).padStart(2, '0')} — ${room.title}`}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{room.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{room.topic}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-300">{room.difficulty}</p>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Room Form" subtitle="Admin managed room configuration">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['room_number', 'Room Number', 'number'],
                  ['title', 'Room Name', 'text'],
                  ['topic', 'Topic', 'text'],
                  ['difficulty', 'Difficulty', 'select'],
                ].map(([field, label, type]) => (
                  <label key={label} className="block">
                    <span className="text-sm text-slate-300">{label}</span>
                    {type === 'select' ? (
                      <select value={roomSummary[field]} onChange={(e) => updateField(field, e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100">
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    ) : (
                      <input
                        type={type}
                        value={roomSummary[field]}
                        onChange={(e) => updateField(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100"
                      />
                    )}
                  </label>
                ))}
                <label className="md:col-span-2 block">
                  <span className="text-sm text-slate-300">Objective</span>
                  <textarea value={roomSummary.objective} onChange={(e) => updateField('objective', e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="md:col-span-2 block">
                  <span className="text-sm text-slate-300">Scenario</span>
                  <textarea value={roomSummary.scenario} onChange={(e) => updateField('scenario', e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                <label className="md:col-span-2 block">
                  <span className="text-sm text-slate-300">Instructions</span>
                  <textarea value={roomSummary.instructions} onChange={(e) => updateField('instructions', e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                </label>
                {[
                  ['time_limit_minutes', 'Time Limit (minutes)'],
                  ['maximum_attempts', 'Maximum Attempts'],
                  ['hint_limit', 'Hint Limit'],
                  ['base_points', 'Base Points'],
                ].map(([field, label]) => (
                  <label key={field} className="block">
                    <span className="text-sm text-slate-300">{label}</span>
                    <input type="number" value={roomSummary[field]} onChange={(e) => updateField(field, Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100" />
                  </label>
                ))}
                <label className="block">
                  <span className="text-sm text-slate-300">Unlock Requirement</span>
                  <select value={roomSummary.unlock_requirement} onChange={(e) => updateField('unlock_requirement', e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100">
                    <option>None</option>
                    {rooms.map((room, index) => (
                      <option key={room.id} value={`Room ${index + 1}`}>{`Room ${index + 1}`}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Room Status</span>
                  <select value={roomSummary.status} onChange={(e) => updateField('status', e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" disabled={saving} onClick={() => persistRoom(roomSummary.id ? 'put' : 'post', roomSummary.id ? `/admin/rooms/${roomSummary.id}` : '/admin/rooms', roomSummary)} className="rounded-2xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => activeRoom && setMessage(`Previewing ${activeRoom.title}.`)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Preview Room</button>
                <button type="button" onClick={() => activeRoom && persistRoom('put', `/admin/rooms/${activeRoom.id}`, { ...roomSummary, status: roomSummary.status === 'active' ? 'disabled' : 'active' })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Activate / Deactivate</button>
                <button type="button" onClick={() => {
                  if (activeRoom && window.confirm(`Delete ${activeRoom.title}? This cannot be undone.`)) {
                    persistRoom('delete', `/admin/rooms/${activeRoom.id}`);
                  }
                }} className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 font-semibold text-rose-100">Delete Room</button>
                <button type="button" onClick={() => moveRoom(-1)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Move Up</button>
                <button type="button" onClick={() => moveRoom(1)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">Move Down</button>
              </div>
              {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}
            </SectionCard>
          </div>
        </DashboardShell>
      )}
    </AdminLayout>
  );
}
