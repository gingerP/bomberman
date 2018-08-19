class BMGamer {
  constructor(game, params = {isLocal: true}) {
    this.isLocal = params.isLocal;
    this.connection = params.connection;
    this.tickDistance = 0.2;
    this.width = 50;
    this.height = 100;
    this.state = {
      position: {
        x: 1.5,
        y: 1.5
      }
    };
    /** @type BMGame */
    this.game = game;
    this.view = new BMGamerView(this.game.getView());
  }

  async init() {
    await this.view.init();
  }

  updateNetworkState() {

  }

  updatePosition() {
    if (!this.state.isMoving) {
      return;
    }
    const {width, height} = this.game.getSize();
    const pos = this.state.position;
    let newX = pos.x;
    let newY = pos.y;
    switch (this.state.direction) {
      case BMDirections.TOP:
        newY -= this.tickDistance;
        if (newY < 0) {
          newY = 0;
        }
        break;
      case BMDirections.RIGHT:
        newX += this.tickDistance;
        if (newX > width) {
          newX = width;
        }
        break;
      case BMDirections.BOTTOM:
        newY += this.tickDistance;
        if (newY > height) {
          newY = height;
        }
        break;
      case BMDirections.LEFT:
        newX -= this.tickDistance;
        if (newX < 0) {
          newX = 0;
        }
        break;
      default:
        break;
    }
    const map = this.game.getMap();
    const borderWidth = this.game.getBorderWidth();
    if (BMGameUtils.canGamerGetUpAtMap(newX, newY, map, borderWidth)) {
      pos.x = BMUtils.round1(newX);
      pos.y = BMUtils.round1(newY);
    }
  }

  async dropBomb() {
    const {x, y} = this.state.position;
    if (BMGameUtils.canGamerDropBomb(x, y, this.game.getMap(), this.game.getBombs())) {
      const bomb = new BMBomb(Math.floor(x), Math.floor(y));
      await bomb.init();
      return bomb;
    }
    return null;
  }

  async updateTickState({direction, isMoving, isSpacePressed}) {
    this.state.bomb = null;
    this.state.direction = direction || this.state.direction;
    this.state.isMoving = isMoving;
    this.state.isSpacePressed = isSpacePressed;
    this.updatePosition();
    if (this.isLocal && this.state.isSpacePressed) {
      this.state.bomb = await this.dropBomb();
    }
    return this.state;
  }

  getState() {
    return this.state;
  }
}
