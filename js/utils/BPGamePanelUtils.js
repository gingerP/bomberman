class BMGamePanelUtils {

  static get POINTS_TYPE_FREE() {
    return 0;
  }

  static get POINTS_TYPE_WALL() {
    return 1;
  }

  static get POINTS_TYPE_DESTRUCTIBLE() {
    return 2;
  }


  static generateMap(width = 10, height = 10) {
    const map = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (!map[y]) {
          map[y] = [];
        }
        map[y][x] = BMGamePanelUtils.POINTS_TYPE_FREE;
        if (BMGamePanelUtils.isStartingAreaForGamer(x, y, width, height)) {
          // do nothing, it already BMGamePanelUtils.POINTS_TYPE_FREE
        } else if (x % 2 === 1 && y % 2 === 1) {
          map[y][x] = BMGamePanelUtils.POINTS_TYPE_WALL;
        } else if (Math.round(Math.random() + 0.2)) {
          map[y][x] = BMGamePanelUtils.POINTS_TYPE_DESTRUCTIBLE;
        }
      }
    }
    return map;
  }

  static isStartingAreaForGamer(x, y, width = 10, height = 10) {
    const rules = [
      {x: 0, y: 0, shifts: [[0, 1], [0, 0], [1, 0]]},
      {x: 1, y: 0, shifts: [[-1, 0], [0, 0], [0, 1]]},
      {x: 1, y: 1, shifts: [[-1, 0], [0, 0], [0, -1]]},
      {x: 0, y: 1, shifts: [[0, -1], [0, 0], [1, 0]]}
    ];
    for (const rule of rules) {
      for (const shift of rule.shifts) {
        if (x === (rule.x * (width - 1) + shift[0]) && y === (rule.y * (height - 1) + shift[1])) {
          return true;
        }
      }
    }
    return false;
  }
}