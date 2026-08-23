export function computeUnlockStatus(rooms = [], progressRows = []) {
  const completedRoomIds = new Set(progressRows.filter((row) => row.status === 'completed').map((row) => row.room_id));
  const orderedRooms = [...rooms].sort((a, b) => Number(a.order_number ?? a.room_number ?? 0) - Number(b.order_number ?? b.room_number ?? 0));

  return orderedRooms.map((room, index) => {
    if (completedRoomIds.has(room.id)) {
      return { ...room, status: 'completed' };
    }

    if (index === 0) {
      return { ...room, status: 'available' };
    }

    const previousRoom = orderedRooms[index - 1];
    return {
      ...room,
      status: completedRoomIds.has(previousRoom.id) ? 'available' : 'locked',
    };
  });
}
