/** @class BMGamer */
class BMGamer {
  /**
   * Gamer position definition
   * @typedef {Object} GamerPosition
   * @property {number} x x position
   * @property {number} y y position
   *
   * Gamer params definition
   * @typedef {Object} GamerParams
   * @property {boolean} local is gamer local
   * @property {string} [color] gamer color
   * @property {number} [id] gamer id
   * @property {GamerPosition} [position] gamer position
   *
   * @param {BMGame} game
   * @param {GamerParams} params
   */
  constructor(game, params = {}) {
    this.id = params.id || `gamer-${BMUtils.randomString(20)}`;
    this.explosionDuration = 3000;
    this.explosionStartTime = null;
    this.local = Boolean(params.local);
    this.color = params.color || GamerColors.WHITE;
    this.tickDistance = 0.2;
    this.width = 50;
    this.height = 100;
    const {position = {}} = params;
    this.state = {
      isMoving: false,
      isSpacePressed: false,
      bomb: null,
      status: GamerStatuses.ACTIVATED,
      direction: null,
      time: null,
      position: {
        x: position.x || 1.5,
        y: position.y || 1.5
      }
    };
    /** @type BMGame */
    this.game = game;
    this.view = new BMGamerView(this.color);
  }

  async init() {
    await this.view.init();
  }

  getId() {
    return this.id;
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

  async updateTickState({time, direction, isMoving, isSpacePressed}) {
    this.previousStateString = JSON.stringify(this.state);
    if (this.local) {
      this.state.time = time;
      this.state.bomb = null;
      this.state.direction = direction || this.state.direction;
      this.state.isMoving = isMoving;
      this.state.isSpacePressed = isSpacePressed;

      const explosions = this.game.getExplosionsMap();
      const {x, y} = this.state.position;
      if (this.state.status === GamerStatuses.EXPLODED) {
        if (Date.now() - this.explosionStartTime >= this.explosionDuration) {
          this.state.status = GamerStatuses.DESTROYED;
        }
      } else if (BMGameUtils.canExplodeFromExternalBomb(Math.floor(x), Math.floor(y), explosions)) {
        this.state.status = GamerStatuses.EXPLODED;
        this.explosionStartTime = Date.now();
      } else {
        this.updatePosition();
        if (this.local && this.state.isSpacePressed) {
          this.state.bomb = await this.dropBomb();
          if (this.state.bomb) {
            this.state.bomb.run();
          }
        }
      }
    } else {
      this.state.bomb = null;

      const explosions = this.game.getExplosionsMap();
      const {x, y} = this.state.position;
      if (this.state.status === GamerStatuses.EXPLODED) {
        if (Date.now() - this.explosionStartTime >= this.explosionDuration) {
          this.state.status = GamerStatuses.DESTROYED;
        }
      } else if (BMGameUtils.canExplodeFromExternalBomb(Math.floor(x), Math.floor(y), explosions)) {
        this.state.status = GamerStatuses.EXPLODED;
        this.explosionStartTime = Date.now();
      }
    }
    return this.state;
  }

  setLocal(local) {
    this.local = Boolean(local);
  }

  isLocal() {
    return this.local;
  }

  getState() {
    return this.state;
  }

  toBeDestroyed() {
    return this.state.status === GamerStatuses.DESTROYED;
  }

  hasChanges() {
    // TODO no guarantees
    return this.previousStateString !== JSON.stringify(this.state);
  }

  deserializeState(state) {
    this.state.isMoving = state.isMoving;
    this.state.bomb = state.bomb ? BMBomb.deserialize(state.bomb) : null;
    this.state.status = state.status;
    this.state.position = state.position;
    this.state.time = state.time;
    this.state.direction = state.direction;
  }

  serializeState() {
    return {
      isMoving: this.state.isMoving,
      bomb: this.state.bomb ? this.state.bomb.serialize() : null,
      status: this.state.status,
      position: this.state.position,
      time: this.state.time,
      direction: this.state.direction
    };
  }

  serialize() {
    return {
      id: this.id,
      local: this.local,
      color: this.color,
      state: this.serializeState(),
      __class: this.constructor.name
    };
  }

  static async deserialize(game, gamerData) {
    const gamer = new BMGamer(game, {
      id: gamerData.id,
      position: gamerData.state.position,
      color: gamerData.color,
      local: gamerData.local
    });
    await gamer.init();
    return gamer;
  }

}
