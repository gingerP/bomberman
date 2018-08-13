class BMGamer {
  constructor(game) {
    this.keyboard = {
      LEFT: 37,
      RIGHT: 39,
      TOP: 38,
      BOTTOM: 40,
      SPACE: 32
    };
    this.tickDistance = 0.2;
    this.keyboardKeysList = Object.values(this.keyboard);
    this.currentKeyboardKey = null;
    this.state = {
      position: {
        x: 0.5,
        y: 0.5
      }
    };
    /** @type BMGame */
    this.game = game;
    this.bindToKeyboard();
  }

  updateNetworkState() {

  }

  bindToKeyboard() {
    document.body.addEventListener('keydown', (event) => {
      if (this.keyboardKeysList.indexOf(event.keyCode) >= 0) {
        this.currentDirection = event.keyCode;
        return;
      }
      this.currentDirection = null;
    }, false);
    document.body.addEventListener('keyup', (event) => {
      if (this.currentDirection === event.keyCode) {
        this.currentDirection = null;
      }
    }, false);
  }

  updatePosition() {
    const {width, height} = this.game.getSize();
    const pos = this.state.position;
    let newX = pos.x;
    let newY = pos.y;
    switch (this.currentDirection) {
      case this.keyboard.TOP:
        newY -= this.tickDistance;
        if (newY < 0) {
          newY = 0;
        }
        break;
      case this.keyboard.RIGHT:
        newX += this.tickDistance;
        if (newX > width) {
          newX = width;
        }
        break;
      case this.keyboard.BOTTOM:
        newY += this.tickDistance;
        if (newY > height) {
          newY = height;
        }
        break;
      case this.keyboard.LEFT:
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

  async getState() {
    return this.state;
  }
}
