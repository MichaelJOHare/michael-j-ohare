import PieceType from "../pieces/PieceType.js";
import ChessPiece from "./ChessPiece.js";
import KnightMovementStrategy from "./movementstrategy/KnightMovementStrategy.js";

class Knight extends ChessPiece {
  static WHITE_KNIGHT = "♞";
  static BLACK_KNIGHT = "♘";

  constructor(currentSquare, player) {
    super(
      currentSquare,
      player,
      PieceType.KNIGHT,
      new KnightMovementStrategy()
    );
  }

  getWhiteChessPieceSymbol() {
    return Knight.WHITE_KNIGHT;
  }

  getBlackChessPieceSymbol() {
    return Knight.BLACK_KNIGHT;
  }
}

export default Knight;
