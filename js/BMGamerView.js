class BMGamerView {
  constructor() {
    this.movementAnimationStep = 0;
    this.width = 50;
    this.height = 100;
    this.spriteWidth = 400;
    this.cellSize = 50;
    this.spriteRowSize = 8;
    const {Directions} = BMGamePanelView;
    this.spriteBlocks = {
      [Directions.BOTTOM]: [[0, 0], [this.spriteWidth, 100]],
      [Directions.TOP]: [[0, 101], [this.spriteWidth, 200]],
      [Directions.RIGHT]: [[0, 201], [this.spriteWidth, 300]],
      [Directions.LEFT]: [[0, 301], [this.spriteWidth, 400]]
    };
  }

  async init() {
    this.image = await BMGameViewUtils.loadImage('/images/bomberman.png');
  }

  render(context, state, time) {
    const {direction, position, isMoving} = state;
    const previousDirection = this.previousState ? this.previousState.direction : BMGamePanelView.Directions.BOTTOM;
    this.previousState = JSON.parse(JSON.stringify(state));
    const sprite = this.updateSpriteImageParams(direction, previousDirection, isMoving);
    context.drawImage(
      this.image,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,

      (position.x - 0.5) * this.cellSize,
      (position.y - 0.5) * this.cellSize - this.cellSize,
      this.width,
      this.height
    );
  }

  clearPreviousFrame(context) {
    if (this.previousState) {
      const {position} = this.previousState;
      context.clearRect(
        (position.x - 0.5) * this.cellSize,
        (position.y - 0.5) * this.cellSize - this.cellSize,
        this.width,
        this.height
      );
    }
  }

  updateSpriteImageParams(direction, previousDirection, isMoving) {
    if (direction !== previousDirection) {
      this.movementAnimationStep = 0;
    }

    const block = direction ? this.spriteBlocks[direction] : this.spriteBlocks.bottom;
    const imageWidth = Math.round(this.spriteWidth / this.spriteRowSize);
    const params = {
      x: imageWidth * this.movementAnimationStep,
      y: block[0][1],
      width: this.width,
      height: this.height
    };
    if (!isMoving || !direction || this.movementAnimationStep === this.spriteRowSize - 1) {
      this.movementAnimationStep = 0;
    } else {
      this.movementAnimationStep++;
    }
    return params;
  }
}
