class Destructible {
  constructor(x, y, params = {}) {
    this.id = params.id || `destructible-${BMUtils.randomString(20)}`;
    this.state = {
      strength: params.strength || 1,
      totalStrength: params.totalStrength || 1,
      position: {x, y}
    };
    this.view = new DestructibleView();
  }

  async init() {
    await this.view.init();
  }

  getId() {
    return this.id;
  }

  updateTickState(game) {
    const explosions = game.getExplosionsMap();
    const {x, y} = this.state.position;
    if (explosions[y] && explosions[y][x]) {
      this.state.strength -= 0.1 * explosions[y][x];
    }
    this.state.strength = this.state.strength < 0 ? 0 : this.state.strength;
    return this.state;
  }

  getState() {
    return this.state;
  }

  getPosition() {
    return this.state.position;
  }

  toBeDestroyed() {
    return !this.state.strength;
  }

  toJson() {
    return {
      id: this.id,
      state: this.state,
      __class: this.constructor.name
    };
  }

  static async deserialize(data) {
    const state = {data};
    const {x, y} = state.position;
    const destructible = new Destructible(x, y, {
      id: data.id,
      strength: state.strength,
      totalStrength: state.totalStrength
    });
    await destructible.init();
    return destructible;
  }
}
