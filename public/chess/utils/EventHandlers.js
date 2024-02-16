import ChessBoardPanel from "../view/ChessBoardPanel.js";
import ChessBoard from "../model/board/ChessBoard.js";

class EventHandlers {
  constructor(
    clearHighlightsCallback,
    clearSquareOnCanvasCallback,
    drawGhostPieceOnCanvasCallback,
    guiController,
    imageLoader,
    canvas,
    board,
    boardHighlighter
  ) {
    this.clearHighlights = clearHighlightsCallback;
    this.clearSquareOnCanvas = clearSquareOnCanvasCallback;
    this.drawGhostPieceOnCanvas = drawGhostPieceOnCanvasCallback;
    this.boardContainer = document.getElementById("chessboard-container");
    this.guiController = guiController;
    this.imageLoader = imageLoader;
    this.canvas = canvas;
    this.board = board;
    this.boardHighlighter = boardHighlighter;

    this.isBoardFlipped = false;
    this.squareSize = 0;
    this.unscaledSquareSize = 0;
    this.dragInitiated = false;
    this.isDragging = false;
    this.isDrawing = false;
    this.readyToDrawCircle = false;
    this.lastTargetSquare = null;
    this.originalSquare = null;
    this.draggingPiece = null;
    this.startX = 0;
    this.startY = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    this.draggingDiv = document.createElement("div");
    this.draggingDiv.className = "draggingDiv";
    this.draggingDiv.style.position = "absolute";
    this.draggingDiv.style.visibility = "hidden";
    this.draggingDiv.style.zIndex = "2";
    this.draggingDiv.style.pointerEvents = "none";
    this.boardContainer.appendChild(this.draggingDiv);
  }

  onMouseDown(event) {
    if (event.button === 0) {
      this.clearHighlights();

      const { row, col } = this.getSquareFromCoordinates(
        event.clientX,
        event.clientY
      );

      const piece = this.board.getPieceAt(row, col);
      if (piece) {
        this.startX = event.clientX;
        this.startY = event.clientY;
        const image = this.imageLoader.getPieceImage(piece);

        const rect = document
          .getElementById("chessboard-container")
          .getBoundingClientRect();
        this.offsetX = event.clientX - rect.left;
        this.offsetY = event.clientY - rect.top;

        this.draggingDiv.innerHTML = `<img src="${image.src}" width="${this.unscaledSquareSize}" height="${this.unscaledSquareSize}">`;
        this.draggingDiv.style.transform = `translate(${
          this.offsetX - this.unscaledSquareSize / 2
        }px, ${this.offsetY - this.unscaledSquareSize / 2}px)`;
        this.draggingDiv.style.visibility = "visible";

        this.draggingPiece = piece;
        this.originalSquare = { row, col };
        this.isDragging = false;
        this.dragInitiated = false;
      }
    } else if (event.button === 2) {
      this.startX = event.clientX;
      this.startY = event.clientY;

      const { row, col } = this.getSquareFromCoordinates(
        this.startX,
        this.startY
      );
      this.originalSquare = { row, col };
      this.isDrawing = true;
    }
  }

  onMouseMove(event) {
    if (event.buttons === 1) {
      if (this.draggingPiece) {
        const moveX = event.clientX - this.startX;
        const moveY = event.clientY - this.startY;

        this.draggingDiv.style.transform = `translate(${
          this.offsetX + moveX - this.unscaledSquareSize / 2
        }px, ${this.offsetY + moveY - this.unscaledSquareSize / 2}px)`;

        const diffX = Math.abs(event.clientX - this.startX);
        const diffY = Math.abs(event.clientY - this.startY);
        if (
          diffX > ChessBoardPanel.DRAG_DELTA ||
          diffY > ChessBoardPanel.DRAG_DELTA
        ) {
          this.isDragging = true;
        }
      }

      if (!this.dragInitiated && this.isDragging) {
        let row = this.isBoardFlipped
          ? 7 - this.originalSquare.row
          : this.originalSquare.row;
        let col = this.isBoardFlipped
          ? 7 - this.originalSquare.col
          : this.originalSquare.col;

        this.guiController.handleDragStart(
          this.draggingPiece.getCurrentSquare().getRow(),
          this.draggingPiece.getCurrentSquare().getCol()
        );
        this.clearSquareOnCanvas(col, row);
        this.drawGhostPieceOnCanvas(
          this.draggingPiece,
          col * this.squareSize,
          row * this.squareSize
        );
        this.dragInitiated = true;
      }
    } else if (event.buttons === 2 && this.isDrawing) {
      const { row, col } = this.getSquareFromCoordinates(
        event.clientX,
        event.clientY
      );
      const currentSquare = { row, col };

      if (
        !this.lastTargetSquare ||
        this.lastTargetSquare.row !== row ||
        this.lastTargetSquare.col !== col
      ) {
        this.lastTargetSquare = { row, col };
        const distance = Math.sqrt(
          Math.pow(event.clientX - this.startX, 2) +
            Math.pow(event.clientY - this.startY, 2)
        );

        // If right click drag inside original square -> draw circle
        const drawThreshold = this.squareSize / 2;
        if (distance < drawThreshold) {
          this.readyToDrawCircle = true;
        } else {
          this.readyToDrawCircle = false;
          this.boardHighlighter.drawTemporaryArrow(
            this.originalSquare,
            currentSquare
          );
        }
      }
    }
  }

  onMouseUp(event) {
    if (event.button === 0) {
      this.clearHighlights();
      this.draggingDiv.style.transform = "translate(0px, 0px)";
      this.draggingDiv.style.visibility = "hidden";

      const { row, col } = this.getSquareFromCoordinates(
        event.clientX,
        event.clientY
      );

      if (this.isDragging) {
        this.guiController.handleDragDrop(row, col);
      } else {
        this.guiController.handleSquareClick(row, col);
      }
      this.draggingPiece = null;
      this.originalSquare = null;
      this.isDragging = false;
      this.dragInitiated = false;
    } else if (event.button === 2) {
      const { row, col } = this.getSquareFromCoordinates(
        event.clientX,
        event.clientY
      );
      const endCoords = { x: event.clientX, y: event.clientY };
      const startCoords = { x: this.startX, y: this.startY };
      const distance = Math.sqrt(
        Math.pow(endCoords.x - startCoords.x, 2) +
          Math.pow(endCoords.y - startCoords.y, 2)
      );

      if (distance < this.squareSize / 2) {
        this.boardHighlighter.addCircle(this.originalSquare);
      } else {
        if (!this.readyToDrawCircle) {
          this.boardHighlighter.addArrow(this.originalSquare, { row, col });
        }
      }

      this.isDrawing = false;
      this.readyToDrawCircle = false;
      this.lastTargetSquare = null;
    }
  }

  onTouchStart(event) {
    const touch = event.touches[0];
    this.onMouseDown({
      ...event,
      clientX: touch.clientX,
      clientY: touch.clientY,
      button: 0,
    });
  }

  onTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    this.onMouseMove({
      ...event,
      clientX: touch.clientX,
      clientY: touch.clientY,
      buttons: 1,
    });
  }

  onTouchEnd(event) {
    const touch = event.changedTouches[0];
    this.onMouseUp({
      ...event,
      clientX: touch.clientX,
      clientY: touch.clientY,
      button: 0,
    });
  }

  getSquareFromCoordinates(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const relX = x - rect.left;
    const relY = y - rect.top;

    const dpi = window.devicePixelRatio || 1;
    const scaleX = (rect.width * dpi) / this.canvas.offsetWidth;
    const scaleY = (rect.height * dpi) / this.canvas.offsetHeight;
    let col = Math.floor((relX * scaleX) / this.squareSize);
    let row = Math.floor((relY * scaleY) / this.squareSize);

    if (this.isBoardFlipped) {
      col = ChessBoard.COLUMN_LENGTH - 1 - col;
      row = ChessBoard.ROW_LENGTH - 1 - row;
    }

    return { row, col };
  }

  updateSquareSize(squareSize, unscaledSquareSize) {
    this.squareSize = squareSize;
    this.unscaledSquareSize = unscaledSquareSize;
  }
}

export default EventHandlers;
