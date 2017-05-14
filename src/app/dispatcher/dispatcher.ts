import { EventHandlerCollection } from './handler.collection';
import { EventHandler } from './handler';

const HANDLERS: EventHandlerCollection = {};

export class EventDispatcher {
  static register(type: any, callback: EventHandler) {
    if (!HANDLERS[type]) {
      HANDLERS[type] = [];
    }
    HANDLERS[type].push(callback);
  }

  static dispatch(type: any, data?: any) {
    HANDLERS[type].forEach(h => h(data));
  }
}
