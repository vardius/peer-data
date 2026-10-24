import { PeerData, type Participant, type Signaling } from 'peer-data';

export interface Line {
  from: string;
  text: string;
}

export interface ChatEvents {
  /** A line from someone else. */
  line(line: Line): void;
  /** The number of peers this one can talk to changed. */
  peers(count: number): void;
}

/** Joins the chat as name. Lines go to everyone connected; theirs arrive through on.line. */
export function joinChat(signaling: Signaling, name: string, on: ChatEvents) {
  const peer = new PeerData(signaling);
  const room = peer.connect('chat');
  const connected = new Set<Participant>();

  room.on('participant', (participant) => {
    participant
      .on('connected', () => {
        connected.add(participant);
        on.peers(connected.size);
      })
      .on('message', (data) => {
        const line = parseLine(data);
        if (line) on.line(line);
      })
      .on('disconnected', () => {
        if (connected.delete(participant)) on.peers(connected.size);
      });
  });

  return {
    say: (text: string): void => {
      room.send(JSON.stringify({ from: name, text } satisfies Line));
    },
    leave: (): void => {
      peer.close();
    },
  };
}

/** A line from a peer, or undefined if it sent something else: peers can send anything. */
function parseLine(data: string | ArrayBuffer): Line | undefined {
  if (typeof data !== 'string') return undefined;
  try {
    const value: unknown = JSON.parse(data);
    if (typeof value !== 'object' || value === null || !('from' in value) || !('text' in value)) return undefined;
    const { from, text } = value;
    return typeof from === 'string' && typeof text === 'string' ? { from, text } : undefined;
  } catch {
    return undefined;
  }
}
