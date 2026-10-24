import type { Signaling, SignalingEvent } from 'peer-data';

const PAIRS: readonly (readonly [string, string])[] = [
	['Ada', 'Alan'],
	['Barbara', 'Edsger'],
	['Grace', 'Ken'],
	['Lin', 'Radia'],
];

/**
 * The names of the two peers each demo on this page runs. Each tab takes the next pair, so tabs open side by
 * side show different names.
 */
export const peerNames: readonly [string, string] = PAIRS[nextPair()] ?? ['Ada', 'Alan'];

function nextPair(): number {
	const key = 'peer-data-demo-pair';
	try {
		const stored = Number(localStorage.getItem(key));
		const pair = Number.isInteger(stored) ? stored % PAIRS.length : 0;
		localStorage.setItem(key, String(pair + 1));
		return pair;
	} catch {
		// No storage, as in some private windows: pick one at random.
		return Math.floor(Math.random() * PAIRS.length);
	}
}

/** The names of the peers this page runs, by the id each uses in its room. */
export class Names {
	readonly #byId = new Map<string, string>();

	/** signaling, which also notes that name sends as the caller of what it sends, and reports each send. */
	track(signaling: Signaling, name: string, onSend?: (event: SignalingEvent) => void): Signaling {
		return {
			send: (event) => {
				this.#byId.set(event.caller.id, name);
				onSend?.(event);
				signaling.send(event);
			},
			subscribe: (listener) => signaling.subscribe(listener),
		};
	}

	/** The name of the peer with id, if it runs in this page. */
	of(id: string): string | undefined {
		return this.#byId.get(id);
	}
}
