class BMBomb {
  constructor(x, y, params = {}) {
    this.id = params.id || `bomb-${BMUtils.randomString(20)}`;
    this.destroyed = false;
    this.range = params.range || 1;
    this.preExplosionTime = 3000;
    this.durationOfExplosion = 3000;
    this.explosionStartTime = null;
    this.startTime = null;
    this.view = new BMBombView(x, y);
    this.state = {
      status: BombStatuses.NOT_ACTIVATED,
      explosions: [],
      explosionsDelta: [],
      position: {x, y}
    };
  }

  async init() {
    await this.view.init();
  }

  getId() {
    return this.id;
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
    const wasExploded = state.status === BombStatuses.EXPLOSION;
    const timeOfExplosionCame = now - this.startTime >= this.preExplosionTime;
    const timeOfExplosionNotExpire = this.explosionStartTime
      && now - this.explosionStartTime < this.durationOfExplosion || !this.explosionStartTime;
    const {x, y} = this.state.position;

    if (state.status === BombStatuses.PREPARE_TO_DESTROY) {
      state.status = BombStatuses.DESTROYED;
    } else if (state.status === BombStatuses.ACTIVATED
      && BMGameUtils.canExplodeFromExternalBomb(x, y, game.getExplosionsMap())
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
        this.explosionStartTime = this.explosionStartTime || now;
        const calculations = this.calculateExplosion(game);
        state.explosions = calculations.explosions;
        state.explosionsDelta = calculations.explosionsDelta;
        break;
      }
      default:
        break;
    }
    this.state.justExploded = !wasExploded && this.state.status === BombStatuses.EXPLOSION;
    return this.state;
  }

  calculateExplosion(game) {
    const map = game.getMap();
    const {x, y} = this.state.position;
    const shifts = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    const explosions = [[y, x]];
    for (const shift of shifts) {
      let step = 1;
      while (step <= this.range) {
        const stepX = x + shift[1] * step;
        const stepY = y + shift[0] * step;
        const cell = map[stepY] && map[stepY][stepX];
        if (cell === BMMapPoints.FREE) {
          explosions.push([stepY, stepX, 1]);
        } else if (cell === BMMapPoints.WALL || cell instanceof Destructible) {
          explosions.push([stepY, stepX, 0]);
          break;
        }
        step++;
      }
    }
    const oldExplosions = this.state.explosions;
    let newIndex = explosions.length;
    const explosionsDelta = [];
    while (newIndex--) {
      let oldIndex = oldExplosions.length;
      const newExplosion = explosions[newIndex];
      let exists = false;
      while (oldIndex--) {
        const oldExplosion = oldExplosions[oldIndex];
        if (oldExplosion[0] === newExplosion[0] && oldExplosion[1] === newExplosion[1]) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        explosionsDelta.push(newExplosion);
      }
    }
    return {explosions, explosionsDelta};
  }

  toBeDestroyed() {
    return this.state.status === BombStatuses.DESTROYED;
  }

  getPosition() {
    return this.state.position;
  }

  toJson() {
    return {
      id: this.id,
      state: this.state,
      range: this.range,
      __class: this.constructor.name
    };
  }

  static async deserialize(bombData) {
    const {x, y} = bombData.state.position;
    const bomd = new BMBomb(x, y, {id: bombData.id, range: bombData.range, local: bombData.local});
    await bomd.init();
    return bomd;
  }
}
