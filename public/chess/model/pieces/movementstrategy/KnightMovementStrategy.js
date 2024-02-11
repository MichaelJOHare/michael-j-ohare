import BaseMovementStrategy from "./BaseMovementStrategy.js";
import Square from "../../board/Square.js";
import Move from "../../moves/Move.js";

class KnightMovementStrategy extends BaseMovementStrategy {
  calculateRawLegalMoves(
    board,
    piece,
    /* eslint-disable-line no-unused-vars */ moveHistory
  ) {
    let rawLegalMoves = [];
    let row = piece.getCurrentSquare().getRow();
    let col = piece.getCurrentSquare().getCol();

    const knightMoves = [
      [-2, 1],
      [-1, 2],
      [2, 1],
      [1, 2],
      [-2, -1],
      [-1, -2],
      [2, -1],
      [1, -2],
    ];

    knightMoves.forEach((m) => {
      let targetRow = row + m[0];
      let targetCol = col + m[1];
      if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
        let currentSquare = piece.getCurrentSquare();
        let targetSquare = new Square(targetRow, targetCol);
        let capturedPiece = null;
        if (board.isOccupied(targetRow, targetCol)) {
          if (
            board.isOccupiedByOpponent(targetRow, targetCol, piece.getPlayer())
          ) {
            capturedPiece = board.getPieceAt(targetRow, targetCol);
          } else {
            return;
          }
        }
        let tempMove = new Move(
          piece,
          currentSquare,
          targetSquare,
          capturedPiece,
          board
        );
        rawLegalMoves.push(tempMove);
      }
    });

    return rawLegalMoves;
  }
}

export default KnightMovementStrategy;
