class BMGamerView {
  constructor() {
    this.movementAnimationStep = 0;
    this.width = 50;
    this.height = 100;
    this.spriteWidth = 400;
    this.cellSize = 50;
    this.spriteRowSize = 8;
    this.spriteBlocks = {
      [BMDirections.BOTTOM]: [[0, 0], [this.spriteWidth, 100]],
      [BMDirections.TOP]: [[0, 101], [this.spriteWidth, 200]],
      [BMDirections.RIGHT]: [[0, 201], [this.spriteWidth, 300]],
      [BMDirections.LEFT]: [[0, 301], [this.spriteWidth, 400]]
    };
  }

  async init() {
    this.image = await BMGameViewUtils.loadImage('images/bomberman.png');
    this.imageAsh = await BMGameViewUtils.loadImage('images/ash.png');
  }

  render(context, state, time) {
    const {direction, position, isMoving} = state;
    this.previousState = JSON.parse(JSON.stringify(state));
    if (state.isExploded) {
      context.drawImage(
        this.imageAsh,
        (position.x - 0.5) * this.cellSize,
        (position.y - 0.8) * this.cellSize + 15,
        50,
        50
      );
    } else {
      const previousDirection = this.previousState ? this.previousState.direction : BMDirections.BOTTOM;
      const sprite = this.updateSpriteImageParams(direction, previousDirection, isMoving);
      context.drawImage(
        this.image,
        sprite.x,
        sprite.y,
        sprite.width,
        sprite.height,

        (position.x - 0.5) * this.cellSize,
        (position.y - 0.8) * this.cellSize - this.cellSize,
        this.width,
        this.height
      );
    }
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
