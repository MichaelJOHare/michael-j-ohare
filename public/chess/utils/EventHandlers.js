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
    this.dragInitiated = false;
    this.isDragging = false;
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

        this.draggingDiv.innerHTML = `<img src="${image.src}" width="${this.squareSize}" height="${this.squareSize}">`;
        this.draggingDiv.style.transform = `translate(${
          this.offsetX - this.squareSize / 2
        }px, ${this.offsetY - this.squareSize / 2}px)`;
        this.draggingDiv.style.visibility = "visible";

        this.draggingPiece = piece;
        this.originalSquare = { row, col };
        this.isDragging = false;
        this.dragInitiated = false;
      }
    } else if (event.button === 2) {
      // set start point for drawing circle/arrow
    }
  }

  onMouseMove(event) {
    if (event.buttons === 1) {
      if (this.draggingPiece) {
        const moveX = event.clientX - this.startX;
        const moveY = event.clientY - this.startY;

        this.draggingDiv.style.transform = `translate(${
          this.offsetX + moveX - this.squareSize / 2
        }px, ${this.offsetY + moveY - this.squareSize / 2}px)`;

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
    } else if (event.buttons === 2) {
      // draw arrow (maybe snap to possible legal squares? knight move, diagonals, sliders)
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
      // if diff of x,y captured in onMouseDown and x,y onMouseUp > DRAG_DELTA -> draw arrow, else draw circle
      //      similar to dragInitiated/isDragging
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

  updateSquareSize(squareSize) {
    this.squareSize = squareSize;
  }
}

export default EventHandlers;
