import ChessPiece from "./ChessPiece.js";
import PieceType from "../pieces/PieceType.js";
import RookMovementStrategy from "./movementstrategy/RookMovementStrategy.js";
import PieceWithMoveStatus from "./PieceWithMoveStatus.js";

class Rook extends PieceWithMoveStatus(ChessPiece) {
  static ROOK_SYMBOL = "♜";

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.ROOK, new RookMovementStrategy());
  }

  getChessPieceSymbol() {
    return Rook.ROOK_SYMBOL;
  }
}

export default Rook;
