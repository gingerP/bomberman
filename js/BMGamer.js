class BMGamer {
  constructor(game) {
    this.tickDistance = 0.2;
    this.state = {
      position: {
        x: 0.5,
        y: 0.5
      }
    };
    /** @type BMGame */
    this.game = game;
    this.view = new BMGamerView();
  }

  async init() {
    await this.view.init();
  }

  updateNetworkState() {

  }

  updatePosition() {
    const {width, height} = this.game.getSize();
    const pos = this.state.position;
    let newX = pos.x;
    let newY = pos.y;
    const {Directions} = BMGamePanelView;
    const direction = this.game.gamePanelView.getCurrentDirection();
    switch (direction) {
      case Directions.TOP:
        newY -= this.tickDistance;
        if (newY < 0) {
          newY = 0;
        }
        break;
      case Directions.RIGHT:
        newX += this.tickDistance;
        if (newX > width) {
          newX = width;
        }
        break;
      case Directions.BOTTOM:
        newY += this.tickDistance;
        if (newY > height) {
          newY = height;
        }
        break;
      case Directions.LEFT:
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

  async updateTickState() {
    this.updatePosition();
    return this.state;
  }

  getState() {
    return this.state;
  }
}
