import ChessBoard from "../model/board/ChessBoard.js";

export default class FENGenerator {
  static toFEN(board, move, gameState) {
    let fen = "";

    const pieceToFENMap = {
      KING: { WHITE: "K", BLACK: "k" },
      QUEEN: { WHITE: "Q", BLACK: "q" },
      ROOK: { WHITE: "R", BLACK: "r" },
      BISHOP: { WHITE: "B", BLACK: "b" },
      KNIGHT: { WHITE: "N", BLACK: "n" },
      PAWN: { WHITE: "P", BLACK: "p" },
    };

    // 1. Piece placement
    for (let row = 0; row < ChessBoard.ROW_LENGTH; row++) {
      let emptySquares = 0;
      for (let col = 0; col < ChessBoard.COLUMN_LENGTH; col++) {
        const piece = board.getPieceAt(row, col);
        if (piece === null) {
          emptySquares++;
        } else {
          if (emptySquares !== 0) {
            fen += emptySquares;
            emptySquares = 0;
          }
          const pieceFEN =
            pieceToFENMap[piece.getType()][piece.getPlayer().getColor()];
          fen += pieceFEN;
        }
      }
      if (emptySquares !== 0) {
        fen += emptySquares;
      }
      if (row < ChessBoard.ROW_LENGTH - 1) {
        fen += "/";
      }
    }

    // Append other FEN parts (simplified for brevity)
    fen += " " + (gameState.currentPlayer.isWhite() ? "w" : "b");
    fen += " " + generateCastlingAvailability(board);
    fen +=
      " " +
      (move.getEnPassantTarget() ? move.getEnPassantTarget().toString() : "-");
    fen += " " + move.halfMoveClock;
    fen += " " + move.fullMoveNumber;

    return fen;
  }
}

function generateCastlingAvailability(board) {
  let castlingAvailability = "";
  const chessBoard = board.getBoard();

  const whiteKing =
    chessBoard[ChessBoard.WHITE_MAJOR_PIECE_ROW][ChessBoard.KING_COLUMN];
  if (whiteKing && whiteKing.getType() === "KING" && !whiteKing.hasMoved) {
    const whiteKingRook =
      chessBoard[ChessBoard.WHITE_MAJOR_PIECE_ROW][ChessBoard.ROOK_COLUMN_1];
    const whiteQueenRook =
      chessBoard[ChessBoard.WHITE_MAJOR_PIECE_ROW][ChessBoard.ROOK_COLUMN_2];
    if (
      whiteKingRook &&
      whiteKingRook.getType() === "ROOK" &&
      !whiteKingRook.hasMoved
    ) {
      castlingAvailability += "K";
    }
    if (
      whiteQueenRook &&
      whiteQueenRook.getType() === "ROOK" &&
      !whiteQueenRook.hasMoved
    ) {
      castlingAvailability += "Q";
    }
  }

  const blackKing =
    chessBoard[ChessBoard.BLACK_MAJOR_PIECE_ROW][ChessBoard.KING_COLUMN];
  if (blackKing && blackKing.getType() === "KING" && !blackKing.hasMoved) {
    const blackKingRook =
      chessBoard[ChessBoard.BLACK_MAJOR_PIECE_ROW][ChessBoard.ROOK_COLUMN_1];
    const blackQueenRook =
      chessBoard[ChessBoard.BLACK_MAJOR_PIECE_ROW][ChessBoard.ROOK_COLUMN_2];
    if (
      blackKingRook &&
      blackKingRook.getType() === "ROOK" &&
      !blackKingRook.hasMoved
    ) {
      castlingAvailability += "k";
    }
    if (
      blackQueenRook &&
      blackQueenRook.getType() === "ROOK" &&
      !blackQueenRook.hasMoved
    ) {
      castlingAvailability += "q";
    }
  }

  return castlingAvailability || "-";
}
