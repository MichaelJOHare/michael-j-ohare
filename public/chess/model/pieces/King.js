import ChessPiece from "./ChessPiece.js";
import PieceType from "../pieces/PieceType.js";
import KingMovementStrategy from "./movementstrategy/KingMovementStrategy.js";
import PieceWithMoveStatus from "./PieceWithMoveStatus.js";

class King extends PieceWithMoveStatus(ChessPiece) {
  static WHITE_KING = "♚";
  static BLACK_KING = "♔";

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.KING, new KingMovementStrategy());
  }

  getWhiteChessPieceSymbol() {
    return King.WHITE_KING;
  }

  getBlackChessPieceSymbol() {
    return King.BLACK_KING;
  }
}

export default King;
