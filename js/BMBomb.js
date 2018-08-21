class BMBomb {
  constructor(x, y) {
    this.isRunning = false;
    this.isExploded = false;
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
    this.isRunning = true;
    this.view.runAnimation();
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