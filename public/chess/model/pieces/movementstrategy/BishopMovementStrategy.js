import Move from "../../moves/Move.js";
import Square from "../../board/Square.js";
import BaseMovementStrategy from "./BaseMovementStrategy.js";

class BishopMovementStrategy extends BaseMovementStrategy {
  calculateRawLegalMoves(
    board,
    piece,
    /* eslint-disable-line no-unused-vars */ moveHistory
  ) {
    let legalMoves = [];
    let row = piece.getCurrentSquare().getRow();
    let col = piece.getCurrentSquare().getCol();

    // Four diagonal directions
    let directions = [
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ];

    directions.forEach((direction) => {
      let newRow = row;
      let newCol = col;

      while (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
        newRow += direction[0];
        newCol += direction[1];

        if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) {
          break;
        }

        let tempMove;
        let currentSquare = piece.getCurrentSquare();
        let targetSquare = new Square(newRow, newCol);
        if (board.isEmpty(newRow, newCol)) {
          tempMove = new Move(piece, currentSquare, targetSquare, null, board);
          legalMoves.push(tempMove);
        } else {
          if (board.isOccupiedByOpponent(newRow, newCol, piece.getPlayer())) {
            let capturedPiece = board.getPieceAt(newRow, newCol);
            tempMove = new Move(
              piece,
              currentSquare,
              targetSquare,
              capturedPiece,
              board
            );
            legalMoves.push(tempMove);
          }
          break;
        }
      }
    });
    return legalMoves;
  }
}

export default BishopMovementStrategy;
