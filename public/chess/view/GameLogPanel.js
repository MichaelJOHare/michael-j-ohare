import PieceType from "../model/pieces/PieceType.js";
import PlayerColor from "../model/player/PlayerColor.js";
import CastlingMove from "../model/moves/CastlingMove.js";
import PromotionMove from "../model/moves/PromotionMove.js";

class GameLogPanel {
  constructor(moveHistory, guiController) {
    this.moveHistory = moveHistory;
    this.gui = guiController;
    this.currentMoveIndex = 0;

    this.gameLog = document.getElementById("move-history");
  }

  updateGameLog() {
    this.currentMoveIndex = this.moveHistory.history.length - 1;
    this.clearGameLog();
    this.writeToGameLog();
    this.highlightCurrentMove();
  }

  writeToGameLog() {
    let pastMoves = this.moveHistory.history;
    let undoneMoves = this.moveHistory.undone.slice().reverse();
    let allMoves = pastMoves.concat(undoneMoves);
    let currentMoveDiv;

    allMoves.forEach((move, index) => {
      let { pieceSymbol, notation } = this.createGameLogObject(move);
      let moveId = "move-" + index;
      let isUndone = index >= this.moveHistory.history.length;

      if (index % 2 === 0) {
        currentMoveDiv = document.createElement("div");
        currentMoveDiv.className = "full-move";
        this.gameLog.appendChild(currentMoveDiv);

        let moveNumberSpan = document.createElement("span");
        moveNumberSpan.className = "move-number";
        moveNumberSpan.innerHTML = `${Math.floor(index / 2) + 1}. `;
        currentMoveDiv.appendChild(moveNumberSpan);
      }

      // check if pawn so CSS color isn't applied to start square
      let pieceColor = move.piece.getPlayer().getColor();
      let pieceType = move.piece.getType();
      let pieceSpan = `<span class="${
        pieceType === PieceType.PAWN
          ? pieceColor === PlayerColor.WHITE
            ? "white-pawn"
            : "black-pawn"
          : pieceColor === PlayerColor.WHITE
          ? "white-piece"
          : "black-piece"
      }">${pieceSymbol}</span>`;

      let moveSpan = document.createElement("span");
      moveSpan.className = "move-history-entry";
      moveSpan.id = moveId;
      moveSpan.innerHTML = pieceSpan + notation;

      moveSpan.addEventListener("click", () => this.onClick(index));

      if (index === this.currentMoveIndex && !isUndone) {
        moveSpan.classList.add("current-move-highlight");
      }

      currentMoveDiv.appendChild(moveSpan);
    });

    if (this.currentMoveIndex !== -1) {
      this.highlightCurrentMove();
    }
  }

  clearGameLog() {
    this.gameLog.innerHTML = "";
  }

  createGameLogObject(move) {
    // FOR DISAMBIGUATION:
    // Need to figure out if two of the same player's knight/rook (and bishop/queen after promotion)
    //      could've captured, or moved to, same square ->
    //                       include rank or file, or both if on same file/rank
    let movingPiece = move.piece;
    let pieceSymbol = "";
    let endSquare = move.endSquare ? move.endSquare.toString() : "";
    let captureSymbol = move.isCapture ? "x" : "";
    let promotionSymbol = move.isPromotion ? "=" : "";
    let notation = "";

    if (move instanceof CastlingMove) {
      notation =
        Math.abs(move.rookStartSquare.getCol() - move.rookEndSquare.getCol()) >
        2
          ? "O-O-O"
          : "O-O";
      return { pieceSymbol, notation };
    }

    if (!(movingPiece.getType() === PieceType.PAWN)) {
      pieceSymbol = movingPiece.getChessPieceSymbol();
    } else if (move.isCapture) {
      pieceSymbol = move.startSquare.toString().substring(0, 1);
    }

    if (move instanceof PromotionMove) {
      pieceSymbol =
        move.capturedPiece !== null
          ? move.startSquare.toString().substring(0, 1)
          : "";
      captureSymbol = move.capturedPiece !== null ? "x" : "";
      let promotedPieceSymbol = movingPiece.getChessPieceSymbol();
      promotionSymbol += promotedPieceSymbol;
    }

    notation =
      captureSymbol +
      endSquare +
      promotionSymbol +
      this.appendCheckOrCheckmateSymbol(move.checkState);

    return { pieceSymbol, notation };
  }

  appendCheckOrCheckmateSymbol(checkState) {
    switch (checkState) {
      case "check":
        return "+";
      case "checkmate":
        return "#";
      default:
        return "";
    }
  }

  highlightCurrentMove() {
    document.querySelectorAll(".current-move-highlight").forEach((elem) => {
      elem.classList.remove("current-move-highlight");
    });

    const currentMoveElem = document.getElementById(
      `move-${this.currentMoveIndex}`
    );
    if (currentMoveElem) {
      currentMoveElem.classList.add("current-move-highlight");
    }
  }

  onClick(clickedIndex) {
    let currentMoveIndex = this.moveHistory.history.length - 1;
    let movesToUndoRedo = clickedIndex - currentMoveIndex;

    if (movesToUndoRedo < 0) {
      // Undo moves
      this.gui.hidePromotionSelector("undo");
      for (let i = movesToUndoRedo; i < -1; i++) {
        this.gui.handleSingleUndo();
      }
      this.gui.handlePreviousMoveButtonClick();
    } else if (movesToUndoRedo > 0) {
      // Redo moves
      this.gui.hidePromotionSelector("redo");
      for (let i = 0; i < movesToUndoRedo - 1; i++) {
        this.gui.handleSingleRedo();
      }
      this.gui.handleNextMoveButtonClick();
    }
    this.currentMoveIndex = clickedIndex;
    this.highlightCurrentMove();
  }
}

export default GameLogPanel;
