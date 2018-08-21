class BMBombView {
  constructor() {
    this.odd = false;
    this.startTime = null;
    this.bombImage = null;
    this.fireImage = null;
  }

  async init() {
    [this.bombImage, this.fireImage] = await Promise.all([
      BMGameViewUtils.loadImage('images/bomb.png'),
      BMGameViewUtils.loadImage('images/fire.png')
    ]);
  }

  clearPreviousFrame(context) {
    if (this.previousState) {
      const {position} = this.previousState;
      context.clearRect(
        position.x * 50,
        position.y * 50,
        50,
        50
      );
    }
  }

  runAnimation() {
    this.isRunning = true;
  }

  render(context, state, time) {
    this.startTime = this.startTime || time;
    this.previousState = state;
    if (this.previousState.isRunning) {
      if (!this.previousState.isExploded) {
        this.odd = !this.odd;
        const {position} = state;
        const {aX, aY, aWidth, aHeight} = this.bombAnimationFunction(time);
        context.drawImage(
          this.bombImage,
          0,
          0,
          50,
          50,

          position.x * 50 + aX,
          position.y * 50 + aY,
          aWidth,
          aHeight
        );
      } else {
        context.drawImage(
          this.fireImage,
          0,
          0,
          50,
          50,

          position.x * 50 + aX,
          position.y * 50 + aY,
          aWidth,
          aHeight
        );
      }
    }

  }

  bombAnimationFunction(time) {
    const dTime = time - this.startTime;
    const step = Math.floor(dTime / 100);
    const cycleStep = step % 10;
    const delta = cycleStep < 5 ? cycleStep : 10 - cycleStep;
    return {
      aX: delta,
      aY: delta,
      aWidth: 50 - delta * 2,
      aHeight: 50 - delta * 2
    };
  }
}
