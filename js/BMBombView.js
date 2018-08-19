class BMBombView {
  constructor() {

  }

  async init() {
    this.image = await BMGameViewUtils.loadImage('/images/bomb.png');
  }

  clearPreviousFrame() {

  }

  render(context, state) {
    const {position} = state;
    context.drawImage(
      this.image,
      0,
      0,
      50,
      50,

      position.x * 50,
      position.y * 50,
      50,
      50
    );
  }
}
