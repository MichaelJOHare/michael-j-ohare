import ChessPiece from "./ChessPiece.js";
import PieceType from "../pieces/PieceType.js";
import QueenMovementStrategy from "./movementstrategy/QueenMovementStrategy.js";

class Queen extends ChessPiece {
  static QUEEN_SYMBOL = "♛";

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.QUEEN, new QueenMovementStrategy());
  }

  getChessPieceSymbol() {
    return Queen.QUEEN_SYMBOL;
  }
}

export default Queen;
