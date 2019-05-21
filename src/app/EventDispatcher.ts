import { EventHandlerCollection } from './EventHandlerCollection';
import { EventHandler } from './EventHandler';

export class EventDispatcher {
  static getInstance = (): EventDispatcher => {
    if (!EventDispatcher.globalInstance) {
      EventDispatcher.globalInstance = new EventDispatcher();
    }

    return EventDispatcher.globalInstance;
  }

  private static globalInstance: EventDispatcher;
  private handlers: EventHandlerCollection = {};

  register = (type: string, callback: EventHandler) => {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(callback);
  }

  unregister = (type: string, callback: EventHandler) => {
    if (this.handlers[type]) {
      const index = this.handlers[type].indexOf(callback);
      if (index !== -1) {
        delete this.handlers[type][index];
      }
    }
  }

  dispatch = (type: string, ...args: any[]) => {
    if (this.handlers[type]) {
      this.handlers[type].forEach(h => h(...args));
    }
  }
}
