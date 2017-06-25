import { EventHandlerCollection } from './EventHandlerCollection';
import { EventHandler } from './EventHandler';

export const HANDLERS: EventHandlerCollection = {};

export class EventDispatcher {
  static register(type: any, callback: EventHandler) {
    if (!HANDLERS[type]) {
      HANDLERS[type] = [];
    }
    HANDLERS[type].push(callback);
  }

  static unregister(type: any, callback: EventHandler) {
    if (HANDLERS[type]) {
      const index = HANDLERS[type].indexOf(callback);
      if (index !== -1) {
        delete HANDLERS[type][index];
      }
    }
  }

  static dispatch(type: any, data?: any) {
    if (HANDLERS[type]) {
      HANDLERS[type].forEach(h => h(data));
    }
  }
}
