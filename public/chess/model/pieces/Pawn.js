import ChessPiece from "./ChessPiece.js";
import PieceType from "../pieces/PieceType.js";
import PawnMovementStrategy from "./movementstrategy/PawnMovementStrategy.js";

class Pawn extends ChessPiece {
  static WHITE_PAWN = "♙";
  static BLACK_PAWN = "♟";

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.PAWN, new PawnMovementStrategy());
  }

  getWhiteChessPieceSymbol() {
    return Pawn.WHITE_PAWN;
  }

  getBlackChessPieceSymbol() {
    return Pawn.BLACK_PAWN;
  }
}

export default Pawn;
