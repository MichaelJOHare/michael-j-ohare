import ChessPiece from "./ChessPiece.js";
import PieceType from "../pieces/PieceType.js";
import RookMovementStrategy from "./movementstrategy/RookMovementStrategy.js";
import PieceWithMoveStatus from "./PieceWithMoveStatus.js";

class Rook extends PieceWithMoveStatus(ChessPiece) {
  static WHITE_ROOK = "♜";
  static BLACK_ROOK = "♖";

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.ROOK, new RookMovementStrategy());
  }

  getWhiteChessPieceSymbol() {
    return Rook.WHITE_ROOK;
  }

  getBlackChessPieceSymbol() {
    return Rook.BLACK_ROOK;
  }
}

export default Rook;
