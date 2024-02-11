import ChessPiece from "./ChessPiece.js";
import PieceType from "../pieces/PieceType.js";
import QueenMovementStrategy from "./movementstrategy/QueenMovementStrategy.js";

class Queen extends ChessPiece {
  static WHITE_QUEEN = "♛";
  static BLACK_QUEEN = "♕";

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.QUEEN, new QueenMovementStrategy());
  }

  getWhiteChessPieceSymbol() {
    return Queen.WHITE_QUEEN;
  }

  getBlackChessPieceSymbol() {
    return Queen.BLACK_QUEEN;
  }
}

export default Queen;
