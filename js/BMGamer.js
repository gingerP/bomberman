class BMGamer {
  constructor(game) {
    this.keyboard = {
      LEFT: 37,
      RIGHT: 39,
      TOP: 38,
      BOTTOM: 40,
      SPACE: 32
    };
    this.tickDistance = 0.3;
    this.keyboardKeysList = Object.values(this.keyboard);
    this.currentKeyboardKey = null;
    this.state = {
      position: {
        x: 0,
        y: 0
      }
    };
    this.game = game;
    this.bindToKeyboard();
  }

  updateNetworkState() {

  }

  bindToKeyboard() {
    document.body.addEventListener('keydown', (event) => {
      console.log(event.keyCode);
      if (this.keyboardKeysList.indexOf(event.keyCode) >= 0) {
        this.currentDirection = event.keyCode;
        return;
      }
      this.currentDirection = null;
    }, false);
    document.body.addEventListener('keyup', () => {
      this.currentDirection = null;
    }, false);
  }

  updatePosition() {
    const {width, height} = this.game.getSize();
    const pos = this.state.position;
    switch (this.currentDirection) {
      case this.keyboard.TOP:
        pos.y -= this.tickDistance;
        if (pos.y < 0) {
          pos.y = 0;
        }
        break;
      case this.keyboard.RIGHT:
        pos.x += this.tickDistance;
        if (pos.x > width - 1) {
          pos.x = width - 1;
        }
        break;
      case this.keyboard.BOTTOM:
        pos.y += this.tickDistance;
        if (pos.y > height - 1) {
          pos.y = height - 1;
        }
        break;
      case this.keyboard.LEFT:
        pos.x -= this.tickDistance;
        if (pos.x < 0) {
          pos.x = 0;
        }
        break;
      default:
        break;
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
