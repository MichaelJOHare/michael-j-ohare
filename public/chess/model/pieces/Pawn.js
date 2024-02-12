import ChessPiece from "./ChessPiece.js";
import PieceType from "../pieces/PieceType.js";
import PawnMovementStrategy from "./movementstrategy/PawnMovementStrategy.js";

class Pawn extends ChessPiece {
  static PAWN_SYMBOL = "♙";

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.PAWN, new PawnMovementStrategy());
  }

  getChessPieceSymbol() {
    return Pawn.PAWN_SYMBOL;
  }
}

export default Pawn;
