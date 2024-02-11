import BaseMovementStrategy from "./BaseMovementStrategy.js";
import Square from "../../board/Square.js";
import Move from "../../moves/Move.js";

class QueenMovementStrategy extends BaseMovementStrategy {
  calculateRawLegalMoves(
    board,
    piece,
    /* eslint-disable-line no-unused-vars */ moveHistory
  ) {
    let rawLegalMoves = [];
    let row = piece.getCurrentSquare().getRow();
    let col = piece.getCurrentSquare().getCol();

    // 8 directions combining rook and bishop movement
    const directions = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];

    directions.forEach((direction) => {
      let currentRow = row + direction[0];
      let currentCol = col + direction[1];

      while (
        currentRow >= 0 &&
        currentRow < 8 &&
        currentCol >= 0 &&
        currentCol < 8
      ) {
        let currentSquare = piece.getCurrentSquare();
        let targetSquare = new Square(currentRow, currentCol);

        if (board.isOccupied(currentRow, currentCol)) {
          if (
            board.isOccupiedByOpponent(
              currentRow,
              currentCol,
              piece.getPlayer()
            )
          ) {
            let capturedPiece = board.getPieceAt(currentRow, currentCol);
            let tempMove = new Move(
              piece,
              currentSquare,
              targetSquare,
              capturedPiece,
              board
            );
            rawLegalMoves.push(tempMove);
          }
          break;
        }

        let tempMove = new Move(
          piece,
          currentSquare,
          targetSquare,
          null,
          board
        );
        rawLegalMoves.push(tempMove);

        currentRow += direction[0];
        currentCol += direction[1];
      }
    });

    return rawLegalMoves;
  }
}

export default QueenMovementStrategy;
