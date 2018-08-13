class BMGameUtils {

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
        map[y][x] = BMGameUtils.POINTS_TYPE_FREE;
        if (BMGameUtils.isStartingAreaForGamer(x, y, width, height)) {
          // do nothing, it already BMGamePanelUtils.POINTS_TYPE_FREE
        } else if (x % 2 === 1 && y % 2 === 1) {
          map[y][x] = BMGameUtils.POINTS_TYPE_WALL;
        } else if (false/*Math.round(Math.random() + 0.2)*/) {
          map[y][x] = BMGameUtils.POINTS_TYPE_DESTRUCTIBLE;
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

  static canGamerGetUpAtMap(x, y, map, borderWidth) {
    const height = map.length;
    const width = map[0].length;
    const xRounded = Math.floor(x);
    const yRounded = Math.floor(y);
    const xInCell = BMUtils.round1(x - xRounded);
    const yInCell = BMUtils.round1(y - yRounded);
    if (map[yRounded][xRounded] === BMGameUtils.POINTS_TYPE_FREE) {
      return !(
        (yInCell <= borderWidth /* Is on TOP border */
        && (yRounded <= 0 || map[yRounded - 1][xRounded] !== BMGameUtils.POINTS_TYPE_FREE))
        || (yInCell >= 1 - borderWidth /* Is in BOTTOM border */
        && (yRounded >= height - 1 || map[yRounded + 1][xRounded] !== BMGameUtils.POINTS_TYPE_FREE))
        || (xInCell <= borderWidth /* Is on LEFT border */
        && (xRounded <= 0 || map[yRounded][xRounded - 1] !== BMGameUtils.POINTS_TYPE_FREE))
        || (xInCell >= 1 - borderWidth /* Is in RIGHT border */
        && (xRounded >= width - 1 || map[yRounded][xRounded + 1] !== BMGameUtils.POINTS_TYPE_FREE))
      );
    }
    return false;
  }
}