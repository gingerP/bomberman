class BMGameUtils {


  static generateMap(width = 10, height = 10, borderWidth = 0) {
    const map = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (!map[y]) {
          map[y] = [];
        }
        map[y][x] = BMMapPoints.FREE;
        if (borderWidth && ((x < borderWidth || x >= width - borderWidth)
          || (y < borderWidth || y >= height - borderWidth))) {
          map[y][x] = BMMapPoints.WALL;
        } else if (BMGameUtils.isStartingAreaForGamer(x, y, width, height, borderWidth)) {
          // do nothing, it already BMGamePanelUtils.POINTS_TYPE_FREE
        } else if (x % 2 === 1 && y % 2 === 1) {
          map[y][x] = BMMapPoints.WALL;
        } else if (false/*Math.round(Math.random() + 0.2)*/) {
          map[y][x] = BMMapPoints.DESTRUCTIBLE;
        }
      }
    }
    return map;
  }

  static isStartingAreaForGamer(x, y, width = 10, height = 10, borderWidth = 0) {
    const s = borderWidth;
    const rules = [
      {x: 0, y: 0, shifts: [[s, 1 + s], [s, s], [1 + s, s]]},
      {x: 1, y: 0, shifts: [[-1 - s, s], [s, s], [-s, 1 + s]]},
      {x: 1, y: 1, shifts: [[-1 - s, -s], [-s, -s], [-s, -1 - s]]},
      {x: 0, y: 1, shifts: [[s, -1 - s], [s, -s], [1 + s, -s]]}
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
    if (map.length > yRounded && map[yRounded][xRounded] === BMMapPoints.FREE) {
      return !(
        (yInCell <= borderWidth /* Is on TOP border */
        && (yRounded <= 0 || map[yRounded - 1][xRounded] !== BMMapPoints.FREE))
        || (yInCell >= 1 - borderWidth /* Is in BOTTOM border */
        && (yRounded >= height - 1 || map[yRounded + 1][xRounded] !== BMMapPoints.FREE))
        || (xInCell <= borderWidth /* Is on LEFT border */
        && (xRounded <= 0 || map[yRounded][xRounded - 1] !== BMMapPoints.FREE))
        || (xInCell >= 1 - borderWidth /* Is in RIGHT border */
        && (xRounded >= width - 1 || map[yRounded][xRounded + 1] !== BMMapPoints.FREE))
      );
    }
    return false;
  }

  static canGamerDropBomb(x, y, map, bombs) {
    const xRounded = Math.floor(x);
    const yRounded = Math.floor(y);
    if (map[yRounded] && map[yRounded][xRounded] === BMMapPoints.FREE) {
      for (const bomb of bombs) {
        const pos = bomb.getPosition();
        if (pos.x === xRounded && pos.y === yRounded) {
          return false;
        }
      }
    }
    return true;
  }
}
