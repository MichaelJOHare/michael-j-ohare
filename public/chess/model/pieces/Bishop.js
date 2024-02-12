import ChessPiece from "./ChessPiece.js";
import PieceType from "../pieces/PieceType.js";
import BishopMovementStrategy from "./movementstrategy/BishopMovementStrategy.js";

class Bishop extends ChessPiece {
  static BISHOP_SYMBOL = "♝";

  constructor(currentSquare, player) {
    super(
      currentSquare,
      player,
      PieceType.BISHOP,
      new BishopMovementStrategy()
    );
  }

  getChessPieceSymbol() {
    return Bishop.BISHOP_SYMBOL;
  }
}

export default Bishop;
