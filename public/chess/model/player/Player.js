import PlayerType from "./PlayerType.js";
import PlayerColor from "./PlayerColor.js";

class Player {
  #color;
  #type;

  constructor(color, type) {
    this.#color = color;
    this.#type = type;
  }

  getColor() {
    return this.#color;
  }

  isWhite() {
    return this.#color === PlayerColor.WHITE;
  }

  isStockfish() {
    return this.#type === PlayerType.AI;
  }

  copy() {
    return new Player(this.#color, this.#type);
  }

  equals(obj) {
    if (this === obj) {
      return true;
    }
    if (
      obj === null ||
      typeof obj !== "object" ||
      this.constructor !== obj.constructor
    ) {
      return false;
    }
    const player = obj;
    return this.#color === player.#color && this.#type === player.#type;
  }

  hashCode() {
    return this.#color + this.#type;
  }
}

export default Player;
