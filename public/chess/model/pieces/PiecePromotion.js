import Queen from "./Queen.js";
import Rook from "./Rook.js";
import Bishop from "./Bishop.js";
import Knight from "./Knight.js";

export default class PiecePromotion {
  static promotePiece(pieceType, player, square) {
    switch (pieceType) {
      case "QUEEN":
        return new Queen(square, player);
      case "ROOK":
        return new Rook(square, player);
      case "BISHOP":
        return new Bishop(square, player);
      case "KNIGHT":
        return new Knight(square, player);
      default:
        throw new Error("Invalid piece type for promotion");
    }
  }
}
