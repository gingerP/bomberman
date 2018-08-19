class BMBomb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.view = new BMBombView(x, y);
    this.state = {
      position: {
        x: this.x,
        y: this.y
      }
    };
  }

  async init() {
    await this.view.init();
  }

  getState() {
    return this.state;
  }

  run() {

  }

  updateTickState() {
    return this.state;
  }

  isFinished() {
    return false;
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y
    };
  }
}