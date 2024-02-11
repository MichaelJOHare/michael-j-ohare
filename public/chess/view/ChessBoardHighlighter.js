import ChessBoardPanel from "./ChessBoardPanel.js";
import EnPassantMove from "../model/moves/EnPassantMove.js";

class ChessBoardHighlighter {
  constructor(board, ctx, offscreenCanvas, offscreenCtx, imageLoader) {
    this.board = board;
    this.ctx = ctx;
    this.offscreenCanvas = offscreenCanvas;
    this.offscreenCtx = offscreenCtx;
    this.svg = document.getElementById("chessSVG");
    this.imageLoader = imageLoader;

    this.isBoardFlipped = false;
    this.squareSize = 0;
    this.kingCheckHighlightedSquare = null;
    this.listOfMovesToHighlight = [];
    this.highlightedSquares = [];
    this.previousMove = null;
    this.previousMoveHighlightedSquares = [];
  }

  drawRankFileLabels(row, col) {
    const rowLabels = this.isBoardFlipped ? "12345678" : "87654321";
    const colLabels = this.isBoardFlipped ? "hgfedcba" : "abcdefgh";
    const fontSize = this.squareSize / 6;
    this.offscreenCtx.font = `bold ${fontSize}px Roboto`;
    this.offscreenCtx.textBaseline = "top";

    // Column labels
    if (row === 7) {
      this.offscreenCtx.fillStyle =
        col % 2 === 1
          ? ChessBoardPanel.DARK_SQUARE_COLOR
          : ChessBoardPanel.LIGHT_SQUARE_COLOR;
      this.offscreenCtx.fillText(
        colLabels[col],
        col * this.squareSize + fontSize * 0.3,
        (row + 1) * this.squareSize - fontSize * 1
      );
    }

    // Row labels
    if (col === 7) {
      this.offscreenCtx.fillStyle =
        row % 2 === 1
          ? ChessBoardPanel.DARK_SQUARE_COLOR
          : ChessBoardPanel.LIGHT_SQUARE_COLOR;
      const labelWidth = this.offscreenCtx.measureText(rowLabels[row]).width;
      this.offscreenCtx.fillText(
        rowLabels[row],
        (col + 1) * this.squareSize - labelWidth - fontSize * 0.3,
        row * this.squareSize + fontSize * 0.3
      );
    }
  }

  drawHighlightedSquares(moves) {
    this.listOfMovesToHighlight = moves;
    this.highlightedSquares = [];

    moves.forEach((move) => {
      const startSquare = move.getStartSquare();
      const endSquare = move.getEndSquare();

      const startRow = this.isBoardFlipped
        ? 7 - startSquare.getRow()
        : startSquare.getRow();
      const startCol = this.isBoardFlipped
        ? 7 - startSquare.getCol()
        : startSquare.getCol();
      const endRow = this.isBoardFlipped
        ? 7 - endSquare.getRow()
        : endSquare.getRow();
      const endCol = this.isBoardFlipped
        ? 7 - endSquare.getCol()
        : endSquare.getCol();

      this.highlightedSquares.push({ row: startRow, col: startCol });
      this.clearSquareOnOffscreenCanvas(startRow, startCol);
      this.drawSelectedPieceHighlightedSquares(startRow, startCol);
      this.drawPieceOnOffscreenCanvas(
        this.board.getPieceAt(startSquare.getRow(), startSquare.getCol()),
        startCol * this.squareSize,
        startRow * this.squareSize
      );

      this.highlightedSquares.push({ row: endRow, col: endCol });
      let highlightColor =
        (endRow + endCol) % 2 === 0
          ? ChessBoardPanel.LIGHT_SQUARE_HIGHLIGHT_COLOR
          : ChessBoardPanel.DARK_SQUARE_HIGHLIGHT_COLOR;

      if (
        this.board.isOccupiedByOpponent(
          endSquare.getRow(),
          endSquare.getCol(),
          move.getPiece().getPlayer()
        ) ||
        move instanceof EnPassantMove
      ) {
        this.drawCornerHighlights(endRow, endCol);
      } else {
        this.drawDotHighlight(endRow, endCol, highlightColor);
      }

      if (endRow === 7 || endCol === 7) {
        this.drawRankFileLabels(endRow, endCol);
      }
    });

    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  drawPreviousMoveHighlightedSquares(move) {
    if (!move) {
      return;
    }
    this.previousMove = move;

    const squares = [move.getStartSquare(), move.getEndSquare()];
    squares.forEach((square) => {
      const row = this.isBoardFlipped ? 7 - square.getRow() : square.getRow();
      const col = this.isBoardFlipped ? 7 - square.getCol() : square.getCol();

      this.previousMoveHighlightedSquares.push({ row, col });
      this.offscreenCtx.fillStyle =
        (row + col) % 2 === 0
          ? ChessBoardPanel.LIGHT_SQUARE_PREVIOUS_MOVE
          : ChessBoardPanel.DARK_SQUARE_PREVIOUS_MOVE;

      this.offscreenCtx.fillRect(
        col * this.squareSize,
        row * this.squareSize,
        this.squareSize,
        this.squareSize
      );

      if (row === 7 || col === 7) {
        this.drawRankFileLabels(row, col);
      }
    });

    const endRow = this.isBoardFlipped
      ? 7 - move.getEndSquare().getRow()
      : move.getEndSquare().getRow();
    const endCol = this.isBoardFlipped
      ? 7 - move.getEndSquare().getCol()
      : move.getEndSquare().getCol();

    this.drawPieceOnOffscreenCanvas(
      move.getPiece(),
      endCol * this.squareSize,
      endRow * this.squareSize
    );

    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  drawSelectedPieceHighlightedSquares(row, col) {
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_SELECTED_PIECE
        : ChessBoardPanel.DARK_SQUARE_SELECTED_PIECE;
    this.offscreenCtx.fillRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );
    if (row === 7 || col === 7) {
      this.drawRankFileLabels(row, col);
    }
  }

  drawDotHighlight(row, col, color) {
    const centerX = (col + 0.5) * this.squareSize;
    const centerY = (row + 0.5) * this.squareSize;
    const radius = this.squareSize * 0.1;

    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    this.offscreenCtx.fillStyle = color;
    this.offscreenCtx.fill();
  }

  drawCornerHighlights(row, col) {
    this.clearSquareOnOffscreenCanvas(row, col);

    // Draw the square with the highlight color
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_HIGHLIGHT_COLOR
        : ChessBoardPanel.DARK_SQUARE_HIGHLIGHT_COLOR;
    this.offscreenCtx.fillRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );

    this.offscreenCtx.save();
    this.offscreenCtx.beginPath();
    this.offscreenCtx.rect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );
    this.offscreenCtx.clip();

    const radius = this.squareSize * 0.58;
    const centerX = (col + 0.5) * this.squareSize;
    const centerY = (row + 0.5) * this.squareSize;
    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_COLOR
        : ChessBoardPanel.DARK_SQUARE_COLOR;

    this.offscreenCtx.fill();
    this.offscreenCtx.restore();

    const endRow = this.isBoardFlipped ? 7 - row : row;
    const endCol = this.isBoardFlipped ? 7 - col : col;
    const piece = this.board.getPieceAt(endRow, endCol);
    if (piece) {
      this.drawPieceOnOffscreenCanvas(
        piece,
        col * this.squareSize,
        row * this.squareSize
      );
    }
  }

  drawKingCheckHighlight() {
    let row = this.kingCheckHighlightedSquare.row;
    let col = this.kingCheckHighlightedSquare.col;

    const visualRow = this.isBoardFlipped ? 7 - row : row;
    const visualCol = this.isBoardFlipped ? 7 - col : col;
    this.clearSquareOnOffscreenCanvas(row, col);

    const centerX = (visualCol + 0.5) * this.squareSize;
    const centerY = (visualRow + 0.5) * this.squareSize;
    const innerRadius = 0;
    const outerRadius = this.squareSize * 0.9;

    const gradient = this.offscreenCtx.createRadialGradient(
      centerX,
      centerY,
      innerRadius,
      centerX,
      centerY,
      outerRadius
    );

    gradient.addColorStop(0, "rgb(255, 0, 0)");
    gradient.addColorStop(0.25, "rgb(231, 0, 0)");
    gradient.addColorStop(0.89, "rgba(169, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(158, 0, 0, 0)");

    this.offscreenCtx.fillStyle = gradient;

    this.offscreenCtx.fillRect(
      visualCol * this.squareSize,
      visualRow * this.squareSize,
      this.squareSize,
      this.squareSize
    );

    const piece = this.board.getPieceAt(row, col);
    if (piece) {
      this.drawPieceOnOffscreenCanvas(
        piece,
        visualCol * this.squareSize,
        visualRow * this.squareSize
      );
    }
    if (row === 7 || col === 7) {
      this.drawRankFileLabels(row, col);
    }
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    this.kingCheckHighlightedSquare = { row, col };
  }

  drawPieceOnOffscreenCanvas(piece, x, y) {
    const image = this.imageLoader.getPieceImage(piece);
    if (image) {
      this.offscreenCtx.drawImage(
        image,
        x,
        y,
        this.squareSize * 0.96,
        this.squareSize * 0.96
      );
    }
  }

  drawCircle(x, y) {
    const ns = "http://www.w3.org/2000/svg";
    let circle = document.createElementNS(ns, "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", this.squareSize / 4);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "green");
    circle.setAttribute("stroke-width", 2);
    this.svg.appendChild(circle);
  }

  drawArrow(x1, y1, x2, y2) {
    const ns = "http://www.w3.org/2000/svg";
    let arrow = document.createElementNS(ns, "line");
    arrow.setAttribute("x1", x1);
    arrow.setAttribute("y1", y1);
    arrow.setAttribute("x2", x2);
    arrow.setAttribute("y2", y2);
    arrow.setAttribute("stroke", "blue");
    arrow.setAttribute("stroke-width", 4);
    arrow.setAttribute("marker-end", "url(#arrowhead)");
    this.svg.appendChild(arrow);
  }

  clearSVG() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  clearHighlights() {
    this.highlightedSquares.forEach((square) => {
      this.redrawSquare(square.row, square.col);
    });
    this.highlightedSquares = [];
    this.listOfMovesToHighlight = [];
  }

  clearPreviousMoveHighlights() {
    this.previousMoveHighlightedSquares.forEach((square) => {
      this.redrawSquare(square.row, square.col);
    });
    this.previousMoveHighlightedSquares = [];
    this.previousMove = null;
  }

  clearSquareOnOffscreenCanvas(row, col) {
    this.offscreenCtx.clearRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );
  }

  redrawSquare(row, col) {
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_COLOR
        : ChessBoardPanel.DARK_SQUARE_COLOR;
    this.offscreenCtx.fillRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );

    const piece = this.board.getPieceAt(row, col);
    if (piece) {
      this.drawPieceOnOffscreenCanvas(
        piece,
        col * this.squareSize,
        row * this.squareSize
      );
    }
  }

  updateSquareSize(squareSize) {
    this.squareSize = squareSize;
  }
}

export default ChessBoardHighlighter;
