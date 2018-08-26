class BMUtils {
  static deferred() {
    return new function () {
      // update 062115 for typeof
      /* A method to resolve the associated Promise with the value passed.
       * If the promise is already settled it does nothing.
       *
       * @param {anything} value : This value is used to resolve the promise
       * If the value is a Promise then the associated promise assumes the state
       * of Promise passed as value.
       */
      this.resolve = null;

      /* A method to reject the assocaited Promise with the value passed.
       * If the promise is already settled it does nothing.
       *
       * @param {anything} reason: The reason for the rejection of the Promise.
       * Generally its an Error object. If however a Promise is passed, then the Promise
       * itself will be the reason for rejection no matter the state of the Promise.
       */
      this.reject = null;

      /* A newly created Promise object.
       * Initially in pending state.
       */
      this.promise = new Promise(function (resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
      }.bind(this));
      //Object.freeze(this);
    }();
  }

  static async runInTimeGap(callback, timeGap) {
    const startTime = Date.now();
    await callback();
    const processTime = Date.now() - startTime;
    if (timeGap > processTime) {
      return new Promise((resolve) => {
        setTimeout(resolve, timeGap - processTime);
      });
    }
  }

  static round1(number) {
    return Math.round(number * 10) / 10;
  }

  static throttle(callback, timeout) {
    let params = null;
    setInterval(() => {
      if (params) {
        callback.call(null, params);
      }
    }, timeout);
    return function (...args) {
      params = args;
    };
  }

  static randomString(length = 20) {
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890~!@#$%^&*()_+|?"}{:><-=';
    let result = '';
    for (let i = 0; i < length; i++) {
      const random = Math.floor(Math.random() * (str.length - 1));
      result += str[random];
    }
    return result;
  }
}
