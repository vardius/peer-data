import type { Server as HttpServer } from 'node:http';
import type { Http2SecureServer } from 'node:http2';
import { Server, type ServerOptions } from 'socket.io';

interface Event {
  type: string;
  room: { id: string };
  caller: { id: string };
  callee?: { id: string } | null;
}

const hasId = (value: unknown): value is { id: string } =>
  typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string' && value.id !== '';

const isEvent = (value: unknown): value is Event =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  typeof value.type === 'string' &&
  'room' in value &&
  hasId(value.room) &&
  'caller' in value &&
  hasId(value.caller);

/**
 * A signaling server for peer-data on socket.io 4. CONNECT and DISCONNECT go to the others in the room, and
 * OFFER, ANSWER and CANDIDATE to the callee alone. A socket speaks only for the ids it joined rooms with, and
 * when it drops, the others in its rooms get a DISCONNECT for each.
 */
export function attachSignaling(
  httpServer: HttpServer | Http2SecureServer,
  options: Partial<ServerOptions> = {},
): Server {
  const io = new Server(httpServer, options);
  /** Every peer id in use, so no socket can claim another's. */
  const claimed = new Set<string>();

  io.on('connection', (socket) => {
    /** The room of each peer id this socket joined with. */
    const own = new Map<string, string>();

    socket.on('message', (event: unknown) => {
      if (!isEvent(event)) return;
      const { id } = event.caller;
      const room = event.room.id;

      switch (event.type) {
        case 'CONNECT':
          if (claimed.has(id)) return;
          claimed.add(id);
          own.set(id, room);
          void socket.join([`room:${room}`, `peer:${id}`]);
          socket.to(`room:${room}`).emit('message', event);
          return;
        case 'DISCONNECT':
          if (own.get(id) !== room) return;
          leave(id, room);
          socket.to(`room:${room}`).emit('message', event);
          return;
        case 'OFFER':
        case 'ANSWER':
        case 'CANDIDATE':
          // Only into the room the id joined: the callee routes it by room.
          if (own.get(id) !== room || !hasId(event.callee)) return;
          socket.to(`peer:${event.callee.id}`).emit('message', event);
          return;
      }
    });

    socket.on('disconnect', () => {
      for (const [id, room] of own) {
        claimed.delete(id);
        io.to(`room:${room}`).emit('message', {
          type: 'DISCONNECT',
          room: { id: room },
          caller: { id },
          callee: null,
          payload: null,
        });
      }
    });

    function leave(id: string, room: string): void {
      claimed.delete(id);
      own.delete(id);
      void socket.leave(`peer:${id}`);
      // The socket may be in the room with another id too.
      if (![...own.values()].includes(room)) void socket.leave(`room:${room}`);
    }
  });

  return io;
}
