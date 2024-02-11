import ChessPiece from "./ChessPiece.js";
import PieceType from "../pieces/PieceType.js";
import BishopMovementStrategy from "./movementstrategy/BishopMovementStrategy.js";

class Bishop extends ChessPiece {
  static WHITE_BISHOP = "♝";
  static BLACK_BISHOP = "♗";

  constructor(currentSquare, player) {
    super(
      currentSquare,
      player,
      PieceType.BISHOP,
      new BishopMovementStrategy()
    );
  }

  getWhiteChessPieceSymbol() {
    return Bishop.WHITE_BISHOP;
  }

  getBlackChessPieceSymbol() {
    return Bishop.BLACK_BISHOP;
  }
}

export default Bishop;
