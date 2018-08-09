class BMObservable {
  constructor() {
    this.__bmoListeners = {};
  }

  on(eventName, listener) {
    if (typeof listener === 'function') {
      this.__bmoListeners[eventName] = this.__bmoListeners[eventName] || [];
      this.__bmoListeners[eventName].push(listener);
    }
  }

  async emit(eventName, data) {
    if (this.__bmoListeners[eventName]) {
      for (const listener of this.__bmoListeners[eventName]) {
        await listener(data, eventName);
      }
    }
  }
}
