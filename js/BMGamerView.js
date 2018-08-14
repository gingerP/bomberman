class BMGamerView {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.cellSize = 50;
  }

  async init() {
    this.image = await BMGameViewUtils.loadImage('/images/gamer_red.png');
  }

  render(context, state) {
    const {position} = state;
    context.drawImage(
      this.image,
      (position.x - 0.5) * this.cellSize,
      (position.y - 0.5) * this.cellSize
    );
  }
}
