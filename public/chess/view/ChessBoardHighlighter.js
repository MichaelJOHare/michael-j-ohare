import ChessBoardPanel from "./ChessBoardPanel.js";
import EnPassantMove from "../model/moves/EnPassantMove.js";

class ChessBoardHighlighter {
  constructor(board, ctx, offscreenCanvas, offscreenCtx, imageLoader) {
    this.board = board;
    this.ctx = ctx;
    this.offscreenCanvas = offscreenCanvas;
    this.offscreenCtx = offscreenCtx;
    this.svg = document.getElementById("chessSVG");
    this.tempArrow = null;
    this.imageLoader = imageLoader;

    this.isBoardFlipped = false;
    this.squareSize = 0;
    this.svgSquareSize = 0;
    this.kingCheckHighlightedSquare = null;
    this.listOfMovesToHighlight = [];
    this.highlightedSquares = [];
    this.previousMove = null;
    this.previousMoveHighlightedSquares = [];
    this.persistentElements = [];
    this.persistentBestMoveArrowElement = [];
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

      const startRow = this.getFlippedCoordinate(startSquare.getRow());
      const startCol = this.getFlippedCoordinate(startSquare.getCol());
      const endRow = this.getFlippedCoordinate(endSquare.getRow());
      const endCol = this.getFlippedCoordinate(endSquare.getCol());

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
      const row = this.getFlippedCoordinate(square.getRow());
      const col = this.getFlippedCoordinate(square.getCol());

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

    const endRow = this.getFlippedCoordinate(move.getEndSquare().getRow());
    const endCol = this.getFlippedCoordinate(move.getEndSquare().getCol());

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

    // fill the square with the highlight color
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

    // fill circle in square with original square color
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

    const endRow = this.getFlippedCoordinate(row);
    const endCol = this.getFlippedCoordinate(col);
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

    const visualRow = this.getFlippedCoordinate(row);
    const visualCol = this.getFlippedCoordinate(col);
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

  drawCircle({ row, col }) {
    this.clearTempCircle();
    this.clearTempArrow();
    const circle = this.createCircleComponent({ row, col });
    this.svg.appendChild(circle);
  }

  drawArrow(originalSquare, endSquare) {
    this.clearTempArrow();
    this.clearTempCircle();
    const components = this.createArrowComponents(originalSquare, endSquare);
    this.svg.appendChild(components.line);
    this.svg.appendChild(components.polygon);
  }

  drawAnalysisArrow(originalSquare, endSquare) {
    this.clearTempAnalysisArrow();

    const components = this.createArrowComponents(originalSquare, endSquare);
    components.line.setAttribute("stroke", "blue");
    components.polygon.setAttribute("fill", "blue");

    this.svg.appendChild(components.line);
    this.svg.appendChild(components.polygon);
  }

  drawTemporaryCircle(square) {
    this.clearTempCircle();
    this.clearTempArrow();
    const tempGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    tempGroup.setAttribute("class", "tempCircle");
    const circle = this.createCircleComponent(square);
    tempGroup.appendChild(circle);
    this.svg.appendChild(tempGroup);
  }

  drawTemporaryArrow(originalSquare, currentSquare) {
    this.clearTempArrow();
    this.clearTempCircle();

    const tempGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    tempGroup.setAttribute("class", "tempArrow");
    const components = this.createArrowComponents(
      originalSquare,
      currentSquare
    );

    tempGroup.appendChild(components.line);
    tempGroup.appendChild(components.polygon);
    this.svg.appendChild(tempGroup);
  }

  drawTemporaryAnalysisArrow(originalSquare, endSquare) {
    this.clearTempAnalysisArrow();

    const analysisGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    analysisGroup.setAttribute("class", "tempAnalysisArrow");

    const components = this.createArrowComponents(originalSquare, endSquare);
    components.line.setAttribute("stroke", "blue");
    components.polygon.setAttribute("fill", "blue");

    analysisGroup.appendChild(components.line);
    analysisGroup.appendChild(components.polygon);

    this.svg.appendChild(analysisGroup);
  }

  addCircle(square) {
    const exists = this.toggleExistingElement("circle", square);
    if (!exists) {
      this.persistentElements.push({ type: "circle", square: square });
      this.drawCircle(square);
    }
  }

  addArrow(startSquare, endSquare) {
    const exists = this.toggleExistingElement("arrow", startSquare, endSquare);
    if (!exists) {
      this.persistentElements.push({
        type: "arrow",
        startSquare: startSquare,
        endSquare: endSquare,
      });
      this.drawArrow(startSquare, endSquare);
    }
  }

  addAnalysisArrow(startSquare, endSquare) {
    this.persistentBestMoveArrowElement = [];
    this.persistentBestMoveArrowElement.push({
      type: "analysisArrow",
      startSquare: startSquare,
      endSquare: endSquare,
    });

    this.drawAnalysisArrow(startSquare, endSquare);
  }

  clearTempCircle() {
    const tempCircles = this.svg.querySelectorAll(".tempCircle");
    tempCircles.forEach((circle) => circle.remove());
  }

  clearTempArrow() {
    const tempArrows = this.svg.querySelectorAll(".tempArrow");
    tempArrows.forEach((arrow) => arrow.remove());
  }

  clearTempAnalysisArrow() {
    const analysisArrows = this.svg.querySelectorAll(".tempAnalysisArrow");
    analysisArrows.forEach((arrow) => arrow.remove());
  }

  clearBestMoveArrow() {
    if (this.persistentBestMoveArrowElement.length > 0) {
      this.persistentBestMoveArrowElement = [];
    }
    this.clearSVG();
  }

  clearSVG() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    if (this.persistentBestMoveArrowElement.length > 0) {
      const bestMoveArrow = this.persistentBestMoveArrowElement[0];
      this.drawAnalysisArrow(
        bestMoveArrow.startSquare,
        bestMoveArrow.endSquare
      );
    }
    this.persistentElements = [];
  }

  clearHighlights() {
    this.clearSVG();
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

  toggleExistingElement(type, startSquare, endSquare = null) {
    let index = -1;
    if (type === "circle") {
      index = this.persistentElements.findIndex(
        (element) =>
          element.type === type &&
          element.square.row === startSquare.row &&
          element.square.col === startSquare.col
      );
    } else if (type === "arrow") {
      index = this.persistentElements.findIndex(
        (element) =>
          element.type === type &&
          element.startSquare.row === startSquare.row &&
          element.startSquare.col === startSquare.col &&
          element.endSquare.row === endSquare.row &&
          element.endSquare.col === endSquare.col
      );
    }

    if (index !== -1) {
      this.persistentElements.splice(index, 1);
      this.updatePersistentElements();
      return true;
    }

    return false;
  }

  updatePersistentElements() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    this.persistentElements.forEach((element) => {
      if (element.type === "circle") {
        this.drawCircle(element.square);
      } else if (element.type === "arrow") {
        this.drawArrow(element.startSquare, element.endSquare);
      }
    });
    if (this.persistentBestMoveArrowElement.length > 0) {
      const bestMoveArrow = this.persistentBestMoveArrowElement[0];
      this.drawAnalysisArrow(
        bestMoveArrow.startSquare,
        bestMoveArrow.endSquare
      );
    }
  }

  createCircleComponent({ row, col }) {
    let circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    row = this.getFlippedCoordinate(row);
    col = this.getFlippedCoordinate(col);
    const x = (col + 0.5) * this.svgSquareSize;
    const y = (row + 0.5) * this.svgSquareSize;
    const lineWidth = this.svgSquareSize / 14;

    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", this.svgSquareSize / 2.5);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "green");
    circle.setAttribute("stroke-width", lineWidth);
    circle.setAttribute("opacity", 0.7);

    return circle;
  }

  createArrowComponents(originalSquare, currentSquare) {
    const ns = "http://www.w3.org/2000/svg";
    const headLength = this.svgSquareSize / 2;
    const lineWidth = this.svgSquareSize / 8;
    const opacity = 0.7;
    let visualOriginalRow = this.getFlippedCoordinate(originalSquare.row);
    let visualOriginalCol = this.getFlippedCoordinate(originalSquare.col);
    let visualCurrentRow = this.getFlippedCoordinate(currentSquare.row);
    let visualCurrentCol = this.getFlippedCoordinate(currentSquare.col);

    const x1 = (visualOriginalCol + 0.5) * this.svgSquareSize;
    const y1 = (visualOriginalRow + 0.5) * this.svgSquareSize;
    const x2 = (visualCurrentCol + 0.5) * this.svgSquareSize;
    const y2 = (visualCurrentRow + 0.5) * this.svgSquareSize;

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const adjustedX2 = x2 - headLength * Math.cos(angle) * 0.85;
    const adjustedY2 = y2 - headLength * Math.sin(angle) * 0.85;

    let line = document.createElementNS(ns, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", adjustedX2);
    line.setAttribute("y2", adjustedY2);
    line.setAttribute("stroke", "green");
    line.setAttribute("stroke-width", lineWidth);
    line.setAttribute("opacity", opacity);

    const arrowPointX = x2 - headLength * Math.cos(angle - Math.PI / 6);
    const arrowPointY = y2 - headLength * Math.sin(angle - Math.PI / 6);
    const arrowPointX2 = x2 - headLength * Math.cos(angle + Math.PI / 6);
    const arrowPointY2 = y2 - headLength * Math.sin(angle + Math.PI / 6);

    let polygon = document.createElementNS(ns, "polygon");
    const points = `${x2},${y2} ${arrowPointX},${arrowPointY} ${arrowPointX2},${arrowPointY2}`;
    polygon.setAttribute("points", points);
    polygon.setAttribute("fill", "green");
    polygon.setAttribute("opacity", opacity);

    return { line, polygon };
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

  getFlippedCoordinate(coordinate) {
    return this.isBoardFlipped ? 7 - coordinate : coordinate;
  }

  updateSquareSize(squareSize) {
    this.squareSize = squareSize;
  }

  updateSVGSquareSize(squareSize) {
    this.svgSquareSize = squareSize;
  }
}

export default ChessBoardHighlighter;
