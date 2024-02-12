import PieceType from "../pieces/PieceType.js";
import ChessPiece from "./ChessPiece.js";
import KnightMovementStrategy from "./movementstrategy/KnightMovementStrategy.js";

class Knight extends ChessPiece {
  static KNIGHT_SYMBOL = "♞";

  constructor(currentSquare, player) {
    super(
      currentSquare,
      player,
      PieceType.KNIGHT,
      new KnightMovementStrategy()
    );
  }

  getChessPieceSymbol() {
    return Knight.KNIGHT_SYMBOL;
  }
}

export default Knight;
