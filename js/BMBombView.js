class BMBombView {
  constructor() {
    this.isRunning = false;
    this.odd = false;
    this.startTime = null;
  }

  async init() {
    this.image = await BMGameViewUtils.loadImage('images/bomb.png');
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
    this.odd = !this.odd;
    const {position} = state;
    const {aX, aY, aWidth, aHeight} = this.animationFunction(time);
    context.drawImage(
      this.image,
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

  animationFunction(time) {
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
