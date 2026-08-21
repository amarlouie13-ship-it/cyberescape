import { roomOrder, roomDefinitions } from '../../src/data/rooms.js';

export function getRoomDefinition(roomId) {
  return roomDefinitions[roomId] ?? roomOrder.find((room) => String(room.roomNumber) === String(roomId)) ?? null;
}

