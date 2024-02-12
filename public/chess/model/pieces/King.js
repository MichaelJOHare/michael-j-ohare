import ChessPiece from "./ChessPiece.js";
import PieceType from "../pieces/PieceType.js";
import KingMovementStrategy from "./movementstrategy/KingMovementStrategy.js";
import PieceWithMoveStatus from "./PieceWithMoveStatus.js";

class King extends PieceWithMoveStatus(ChessPiece) {
  static KING_SYMBOL = "♚";

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.KING, new KingMovementStrategy());
  }

  getChessPieceSymbol() {
    return King.KING_SYMBOL;
  }
}

export default King;
