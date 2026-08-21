export function computeUnlockStatus(rooms = [], progressRows = []) {
  const completedRoomIds = new Set(
    progressRows.filter((row) => row.status === 'completed').map((row) => row.room_id),
  );

  return rooms.map((room, index) => {
    if (index === 0) {
      return { ...room, status: completedRoomIds.has(room.id) ? 'completed' : 'available' };
    }

    const previousRoom = rooms[index - 1];
    if (completedRoomIds.has(room.id)) {
      return { ...room, status: 'completed' };
    }

    return {
      ...room,
      status: completedRoomIds.has(previousRoom.id) ? 'available' : 'locked',
    };
  });
}

