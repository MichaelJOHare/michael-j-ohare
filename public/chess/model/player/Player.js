import PlayerType from "./PlayerType.js";
import PlayerColor from "./PlayerColor.js";

class Player {
  #color;
  #type;
  #name;

  constructor(color, type, name) {
    this.#color = color;
    this.#type = type;
    this.#name = name;
  }

  getName() {
    return this.#name;
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
    return new Player(this.#color, this.#type, this.#name);
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
    return (
      this.#color === player.#color &&
      this.#type === player.#type &&
      this.#name === player.#name
    );
  }

  hashCode() {
    return this.#color + this.#type + this.#name;
  }
}

export default Player;
