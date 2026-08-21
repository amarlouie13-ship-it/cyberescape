export default function RoomCard({ room, onSelect, onPlay }) {
  const isLocked = room.status === 'locked';
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-cyan-300">Room {room.room_number}</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{room.title}</h3>
      <p className="mt-1 text-sm text-slate-400">{room.topic}</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="rounded-full border border-white/10 px-3 py-1 uppercase tracking-[0.2em] text-slate-300">{room.status}</span>
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSelect?.(room)}
          className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLocked ? 'Locked' : onPlay ? 'Play' : 'Open'}
        </button>
      </div>
    </div>
  );
}
