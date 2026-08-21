import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import RoomCard from '../../components/game/RoomCard';

export default function RoomsHubPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    api.get('/api/game/rooms').then(({ data }) => setRooms(data.rooms ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">Available Rooms</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onSelect={() => navigate(`/game/rooms/${room.id}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}
