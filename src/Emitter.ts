export type Listener<T> = (value: T) => void;

export const toError = (error: unknown): Error => (error instanceof Error ? error : new Error(String(error)));

/**
 * Rethrows error in a microtask, where the host reports it as uncaught: for errors that nothing listens for,
 * which would otherwise be lost.
 */
export function report(error: unknown): void {
  queueMicrotask(() => {
    throw error;
  });
}

/**
 * Typed events for Room and Participant.
 *
 * Listener lists are copied when they change, never when an event fires: emitting allocates nothing, and a
 * listener added or removed while an event is being delivered takes effect from the next one. A listener that
 * throws doesn't stop the others: its error is reported, as EventTarget does.
 */
export class Emitter<Events> {
  #listeners: { [K in keyof Events]?: readonly Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(type: K, listener: Listener<Events[K]>): void {
    this.#listeners[type] = [...(this.#listeners[type] ?? []), listener];
  }

  off<K extends keyof Events>(type: K, listener: Listener<Events[K]>): void {
    const listeners = this.#listeners[type];
    if (listeners === undefined) return;
    const index = listeners.indexOf(listener);
    if (index === -1) return;
    this.#listeners[type] = listeners.toSpliced(index, 1);
  }

  /** Calls every listener of type with value, and reports whether there was one. */
  emit<K extends keyof Events>(type: K, value: Events[K]): boolean {
    const listeners = this.#listeners[type];
    if (listeners === undefined || listeners.length === 0) return false;
    for (let i = 0; i < listeners.length; i++) {
      try {
        listeners[i]?.(value);
      } catch (error) {
        report(error);
      }
    }
    return true;
  }
}
