class DestructibleView {
  constructor() {
    this.cellSize = 50;
  }

  async init() {
    this.image = await BMGameViewUtils.loadImage('images/wood_01.png');
  }

  render(context, state, time) {
    const {x, y} = state.position;
    if (state.strength) {
      context.drawImage(this.image, x * this.cellSize, y * this.cellSize);
    }
  }
}
