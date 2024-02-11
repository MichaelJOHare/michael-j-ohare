import ChessBoard from "../model/board/ChessBoard.js";
import PieceType from "../model/pieces/PieceType.js";
import PlayerColor from "../model/player/PlayerColor.js";

export default class FENGenerator {
  static toFEN(board, move, gameState) {
    let fen = "";

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
          fen += pieceToFEN(piece);
        }
      }
      if (emptySquares !== 0) {
        fen += emptySquares;
      }
      if (row < 7) {
        fen += "/";
      }
    }

    // 2. The side to move
    fen += " " + (gameState.currentPlayer.isWhite() ? "w" : "b") + " ";

    // 3. Castling availability
    fen += generateCastlingAvailability(board);

    // 4. En passant target square
    fen +=
      " " +
      (move.getEnPassantTarget() ? move.getEnPassantTarget().toString() : "-") +
      " ";

    // 5. Halfmove clock
    fen += " " + move.halfMoveClock + " ";

    // 6. Fullmove number
    fen += " " + move.fullMoveNumber;

    return fen;
  }
}

function pieceToFEN(piece) {
  if (!piece || !piece.getType() || !piece.getPlayer()) {
    throw new Error("Invalid piece");
  }

  const pieceType = piece.getType();
  const playerColor = piece.getPlayer().getColor();

  switch (pieceType) {
    case PieceType.KING:
      return playerColor === PlayerColor.WHITE ? "K" : "k";
    case PieceType.QUEEN:
      return playerColor === PlayerColor.WHITE ? "Q" : "q";
    case PieceType.ROOK:
      return playerColor === PlayerColor.WHITE ? "R" : "r";
    case PieceType.BISHOP:
      return playerColor === PlayerColor.WHITE ? "B" : "b";
    case PieceType.KNIGHT:
      return playerColor === PlayerColor.WHITE ? "N" : "n";
    case PieceType.PAWN:
      return playerColor === PlayerColor.WHITE ? "P" : "p";
    default:
      throw new Error("Unknown piece type");
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
