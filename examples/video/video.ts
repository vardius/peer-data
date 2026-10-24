import { PeerData, type Signaling } from 'peer-data';

export interface CallEvents {
  /** The stream a participant shares arrived, or gained a track. */
  stream(id: string, stream: MediaStream): void;
  /** A participant left. */
  left(id: string): void;
}

/** Joins the call and shares stream with everyone in it. Their streams arrive through on.stream. */
export function joinCall(signaling: Signaling, stream: MediaStream, on: CallEvents) {
  const peer = new PeerData(signaling);
  const room = peer.connect('call', stream);

  room.on('participant', (participant) => {
    participant
      .on('track', ({ streams: [remote] }) => {
        if (remote) on.stream(participant.id, remote);
      })
      .on('disconnected', () => {
        on.left(participant.id);
      });
  });

  return {
    leave: (): void => {
      peer.close();
    },
  };
}
