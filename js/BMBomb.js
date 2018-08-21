class BMBomb {
  constructor(x, y) {
    this.timeBeforeExplosion = 3000;
    this.x = x;
    this.y = y;
    this.view = new BMBombView(x, y);
    this.state = {
      isRunning: false,
      isExploded: false,
      directionsForExplosion: {
        top: 0, right: 0, bottom: 0, left: 0
      },
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
    this.startTime = Date.now();
    this.state.isRunning = true;
    this.view.runAnimation();
  }

  updateTickState(game) {
    if (this.state.isRunning) {
      if (Date.now() - this.startTime >= this.timeBeforeExplosion) {
        const map = game.getMap();
        this.state.isExploded = true;
        const {x, y} = this.state.position;
        const directions = this.state.directionsForExplosion;
        const points = [BMMapPoints.FREE, BMMapPoints.DESTRUCTIBLE];
        directions.top = y > 0 && points.includes(map[y - 1][x]) ? 1 : 0;
        directions.right = x < map[y].length - 1 && points.includes(map[y][x + 1]) ? 1 : 0;
        directions.bottom = y < map.length - 1 && points.includes(map[y + 1][x]) ? 1 : 0;
        directions.left = x > 0 && points.includes(map[y][x - 1]) ? 1 : 0;
      }
    }
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