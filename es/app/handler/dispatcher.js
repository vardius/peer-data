const HANDLERS = {};
export class EventDispatcher {
    static register(type, callback) {
        if (!HANDLERS[type]) {
            HANDLERS[type] = [];
        }
        HANDLERS[type].push(callback);
    }
    static dispatch(type, data) {
        HANDLERS[type].forEach(h => h(data));
    }
}
//# sourceMappingURL=dispatcher.js.map