class BMBomb {
  constructor(x, y) {
    this.destroyed = false;
    this.preExplosionTime = 3000;
    this.durationOfExplosion = 3000;
    this.explosionStartTime = null;
    this.startTime = null;
    this.expired = false;
    this.x = x;
    this.y = y;
    this.view = new BMBombView(x, y);
    this.state = {
      status: BombStatuses.NOT_ACTIVATED,
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
    if (this.state.status === BombStatuses.NOT_ACTIVATED) {
      this.startTime = Date.now();
      this.state.status = BombStatuses.ACTIVATED;
      this.view.runAnimation();
    }
  }

  explode() {
    if (this.state.status === BombStatuses.ACTIVATED) {
      this.explosionStartTime = Date.now();
      this.state.status = BombStatuses.EXPLOSION;
    }
  }

  updateTickState(game) {
    const now = Date.now();
    const {state} = this;
    const timeOfExplosionCame = now - this.startTime >= this.preExplosionTime;
    const timeOfExplosionNotExpire = this.explosionStartTime
      && now - this.explosionStartTime < this.durationOfExplosion || !this.explosionStartTime;

    if (state.status === BombStatuses.PREPARE_TO_DESTROY) {
      state.status = BombStatuses.DESTROYED;
    } else if (state.status === BombStatuses.ACTIVATED
      && BMGameUtils.canExplodeFromExternalBomb(this.x, this.y, game.getExplosionsMap())
      || (state.status === BombStatuses.EXPLOSION || timeOfExplosionCame) && timeOfExplosionNotExpire) {
      state.status = BombStatuses.EXPLOSION;
    } else if (!timeOfExplosionNotExpire) {
      state.status = BombStatuses.PREPARE_TO_DESTROY;
    }

    switch (state.status) {
      case BombStatuses.NOT_ACTIVATED:
        break;
      case BombStatuses.ACTIVATED:
        break;
      case BombStatuses.EXPLOSION: {
        const map = game.getMap();
        this.explosionStartTime = this.explosionStartTime || now;
        const {x, y} = this.state.position;
        const directions = this.state.directionsForExplosion;
        const points = [BMMapPoints.FREE, BMMapPoints.DESTRUCTIBLE];
        directions.top = y > 0 && points.includes(map[y - 1][x]) ? 1 : 0;
        directions.right = x < map[y].length - 1 && points.includes(map[y][x + 1]) ? 1 : 0;
        directions.bottom = y < map.length - 1 && points.includes(map[y + 1][x]) ? 1 : 0;
        directions.left = x > 0 && points.includes(map[y][x - 1]) ? 1 : 0;
        break;
      }
      default:
        break;
    }
    return this.state;
  }

  _canExplodeFromExternalBomb(game) {

  }

  toBeDestroyed() {
    return this.state.status === BombStatuses.DESTROYED;
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y
    };
  }
}