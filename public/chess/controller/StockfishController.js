import FENGenerator from "../utils/FENGenerator.js";
import Debouncer from "../utils/Debouncer.js";
import Move from "../model/moves/Move.js";
import PromotionMove from "../model/moves/PromotionMove.js";
import Square from "../model/board/Square.js";
import EnPassantMove from "../model/moves/EnPassantMove.js";
import CastlingMove from "../model/moves/CastlingMove.js";
import PieceType from "../model/pieces/PieceType.js";
import ChessBoard from "../model/board/ChessBoard.js";

class StockfishController {
  static ENGINE_SETTINGS = [
    { skill: -9, depth: 5, moveTime: 50 },
    { skill: -5, depth: 5, moveTime: 100 },
    { skill: -1, depth: 5, moveTime: 150 },
    { skill: 3, depth: 5, moveTime: 200 },
    { skill: 7, depth: 5, moveTime: 300 },
    { skill: 11, depth: 8, moveTime: 400 },
    { skill: 16, depth: 13, moveTime: 500 },
    { skill: 20, depth: 22, moveTime: 1000 },
  ];
  static DEFAULT_DEPTH = 24;
  static UPDATE_INTERVAL = 3000;
  static DEPTH_INTERVAL = 3;

  constructor(board, move, gameState, gui, strengthLevel) {
    this.board = board;
    this.move = move;
    this.gameState = gameState;
    this.gui = gui;
    this.strengthLevel = strengthLevel;

    this._initializeProperties();
  }

  _initializeProperties() {
    this._debouncer = new Debouncer(300);
    this._isNNUEAnalysisEnabled = false;
    this._isClassicalAnalysisEnabled = false;
    this._isAnalysisMode = this.strengthLevel === 0;
    this._isEvalDepthBarsEnabled = false;
    this._isBoardFlipped = false;

    this._lastCommand = "";
    this._lastArrowUpdate = Date.now();
    this._lastDepthUpdated = 0;
    this._positionHash = null;
    this._bestMove = null;
    this._moveResolver = null;
    this._stockfish = null;
  }

  _ensureEngineInitialized() {
    if (this._stockfish) {
      return Promise.resolve();
    } else {
      this._stockfish = new Worker("/chess/stockfish/stockfish-nnue-16.js");
      this._stockfish.onmessage = this._handleStockfishMessage.bind(this);
      return this._initEngine(!this._isAnalysisMode);
    }
  }

  async _initEngine(isPlaying) {
    this._sendCommand("uci");
    if (isPlaying) {
      const skill = this._getEngineSettings().skill;
      this._sendCommand(`setoption name Skill Level value ${skill}`);
    } else {
      this._sendCommand("setoption name UCI_AnalyseMode value true");
      const threads = this._isNNUEAnalysisEnabled
        ? this._calculateThreadsForNNUE()
        : 1;
      this._sendCommand(`setoption name Threads value ${threads}`);
      if (this._isNNUEAnalysisEnabled) {
        this._sendCommand("setoption name Use NNUE value true");
      }
    }
    this._sendCommand("ucinewgame");
    await this._waitForEngineReady();
  }

  async _waitForEngineReady() {
    return new Promise((resolve) => {
      const handleReady = (event) => {
        if (event.data === "readyok") {
          this._stockfish.removeEventListener("message", handleReady);
          resolve();
        }
      };
      this._stockfish.addEventListener("message", handleReady);
      this._sendCommand("isready");
    });
  }

  _sendCommand(command) {
    this._lastCommand = command;
    this._stockfish.postMessage(command);
  }

  _handleStockfishMessage(event) {
    if (event.data.startsWith("info depth") && this._isAnalysisMode) {
      this._updateAnalysisFromDepthInfo(event.data);
    } else if (event.data.startsWith("bestmove")) {
      const bestMoveStr = event.data.split(" ")[1];
      if (this._isAnalysisMode && this._lastCommand !== "stop") {
        this._addBestMoveAnalysisArrow(bestMoveStr);
      } else if (!this._isAnalysisMode) {
        const move = this._processBestMoveEvent(bestMoveStr);
        if (this._moveResolver) {
          this._moveResolver(move);
          this._moveResolver = null;
        }
      }
    }
  }

  _shouldRequestAnalysis(newPositionHash) {
    return (
      (this._isNNUEAnalysisEnabled || this._isClassicalAnalysisEnabled) &&
      newPositionHash !== this._positionHash
    );
  }

  _getAnalysisMove(fen) {
    this._sendCommand(`position fen ${fen}`);
    this._sendCommand(`go depth ${StockfishController.DEFAULT_DEPTH}`);
  }

  _processBestMoveEvent(bestMoveStr) {
    const promotionChar = bestMoveStr.length > 4 ? bestMoveStr[4] : null;
    let isEnPassant = false,
      isCastlingMove = false;

    const fromNotation = bestMoveStr.substring(0, 2);
    const toNotation = bestMoveStr.substring(2, 4);
    const fromRowCol = this._convertNotationToSquare(fromNotation);
    const toRowCol = this._convertNotationToSquare(toNotation);
    const fromSquare = new Square(fromRowCol.row, fromRowCol.col);
    const toSquare = new Square(toRowCol.row, toRowCol.col);
    const movingPiece = this.board.getPieceAt(fromRowCol.row, fromRowCol.col);
    const capturedPiece = this.board.getPieceAt(toRowCol.row, toRowCol.col);

    isEnPassant = this._isEnPassantMove(
      movingPiece,
      fromRowCol,
      toRowCol,
      capturedPiece
    );
    isCastlingMove = this._isCastlingMove(movingPiece, fromRowCol, toRowCol);

    if (promotionChar) {
      const promotionType = this._determinePromotionType(promotionChar);
      const promoMove = new PromotionMove(
        movingPiece,
        fromSquare,
        toSquare,
        capturedPiece,
        promotionType,
        this.board
      );
      promoMove.setPromotion(true);
      return promoMove;
    } else if (isEnPassant) {
      return this._createEnPassantMove(
        movingPiece,
        fromSquare,
        toSquare,
        toRowCol
      );
    } else if (isCastlingMove) {
      return this._createCastlingMove(
        movingPiece,
        fromSquare,
        toSquare,
        fromRowCol,
        toRowCol
      );
    } else {
      return new Move(
        movingPiece,
        fromSquare,
        toSquare,
        capturedPiece,
        this.board
      );
    }
  }

  _isEnPassantMove(movingPiece, fromRowCol, toRowCol) {
    return (
      movingPiece.getType() === PieceType.PAWN &&
      Math.abs(toRowCol.col - fromRowCol.col) === 1 &&
      this.board.isEmpty(toRowCol.row, toRowCol.col)
    );
  }

  _isCastlingMove(movingPiece, fromRowCol, toRowCol) {
    return (
      movingPiece.getType() === PieceType.KING &&
      Math.abs(toRowCol.col - fromRowCol.col) > 1
    );
  }

  _createEnPassantMove(movingPiece, fromSquare, toSquare, toRowCol) {
    const direction = movingPiece.getPlayer().isWhite() ? -1 : 1;
    const epCapturedPiece = this.board.getPieceAt(
      toRowCol.row + direction,
      toRowCol.col
    );
    const epSquareBeforeCapture = epCapturedPiece.getCurrentSquare();
    return new EnPassantMove(
      movingPiece,
      fromSquare,
      toSquare,
      epSquareBeforeCapture,
      epCapturedPiece,
      this.board
    );
  }

  _createCastlingMove(movingPiece, fromSquare, toSquare, fromRowCol, toRowCol) {
    const [castlingRook, rookFromSquare, rookToSquare] =
      this._getCastlingRookAndSquares(fromRowCol, toRowCol);
    return new CastlingMove(
      movingPiece,
      castlingRook,
      fromSquare,
      toSquare,
      rookFromSquare,
      rookToSquare,
      this.board
    );
  }

  _getCastlingRookAndSquares(fromRowCol, toRowCol) {
    const isQueenside = fromRowCol.col > toRowCol.col;

    const rookStartCol = isQueenside
      ? ChessBoard.ROOK_COLUMN_1
      : ChessBoard.ROOK_COLUMN_2;
    const rookEndCol = isQueenside
      ? ChessBoard.QUEEN_COLUMN
      : ChessBoard.BISHOP_COLUMN_2;

    const rook = this.board.getPieceAt(fromRowCol.row, rookStartCol);
    const rookFromSquare = new Square(fromRowCol.row, rookStartCol);
    const rookToSquare = new Square(fromRowCol.row, rookEndCol);

    return [rook, rookFromSquare, rookToSquare];
  }

  _determinePromotionType(char) {
    switch (char) {
      case "q":
        return "QUEEN";
      case "r":
        return "ROOK";
      case "b":
        return "BISHOP";
      case "n":
        return "KNIGHT";
      default:
        return null;
    }
  }

  _updateAnalysisFromDepthInfo(data) {
    if (this.strengthLevel === 0) {
      const depth = parseInt(data.split(" ")[2], 10);
      const currentTime = Date.now();
      const depthProgress = document.getElementById("depth-progress");
      if (depthProgress) {
        const depthPercentage = (depth / 24) * 100;
        depthProgress.setAttribute("value", depthPercentage);
        // maybe update a div current depth / 24
      }

      if (
        depth === 1 ||
        (depth - this._lastDepthUpdated >= StockfishController.DEPTH_INTERVAL &&
          currentTime - this._lastArrowUpdate >=
            StockfishController.UPDATE_INTERVAL)
      ) {
        const moveData = data.match(/pv (\w{2}\w{2})/);
        if (moveData) {
          this._updateTemporaryAnalysisArrow(moveData[1]);
          this._lastDepthUpdated = depth;
          this._lastArrowUpdate = currentTime;
        }
      }
      // update current centipawn eval (maybe move this and _updateEvalGauge inside if statement?)
      this._updateEvalGauge(data);
    }
  }

  _updateEvalGauge(data) {
    const evalMatch = data.match(/score cp (\-?\d+)/);
    const evalMateMatch = data.match(/score mate (\-?\d+)/);
    const evalGauge = document.getElementById("eval-gauge");
    if (evalGauge && evalMatch) {
      let evalValue = parseInt(evalMatch[1], 10);
      let evalProgress = 50;
      const evalCap = 500;

      if (evalValue > evalCap) evalValue = evalCap;
      if (evalValue < -evalCap) evalValue = -evalCap;

      if (this._isBoardFlipped) {
        evalProgress -= (evalValue / evalCap) * 50;
      } else {
        evalProgress += (evalValue / evalCap) * 50;
      }

      evalProgress = Math.max(0, Math.min(100, evalProgress));

      evalGauge.setAttribute("value", evalProgress);
    }
    if (evalMateMatch) {
      evalGauge.setAttribute("value", 100);
    }
  }

  _updateTemporaryAnalysisArrow(moveData) {
    const fromSquare = moveData.substring(0, 2);
    const toSquare = moveData.substring(2, 4);
    this._addTemporaryAnalysisArrow(fromSquare, toSquare);
  }

  _addTemporaryAnalysisArrow(fromSquare, toSquare) {
    const from = this._convertNotationToSquare(fromSquare);
    const to = this._convertNotationToSquare(toSquare);

    this.gui.handleAnalysisArrow(from, to);
  }

  _addBestMoveAnalysisArrow(bestMoveStr) {
    this.gui.clearBestMoveArrow();
    this._bestMove = bestMoveStr;
    const fromSquare = bestMoveStr.substring(0, 2);
    const toSquare = bestMoveStr.substring(2, 4);

    const from = this._convertNotationToSquare(fromSquare);
    const to = this._convertNotationToSquare(toSquare);

    this.gui.handleBestMoveArrow(from, to);
  }

  _stopCurrentAnalysis() {
    this._sendCommand("stop");
  }

  _calculatePositionHash() {
    return FENGenerator.toFEN(this.board, this.move, this.gameState);
  }

  _convertNotationToSquare(notation) {
    const col = notation.charCodeAt(0) - "a".charCodeAt(0);
    const row = 8 - parseInt(notation[1]);

    return { row, col };
  }

  _getEngineSettings() {
    const index = Math.max(
      0,
      Math.min(
        this.strengthLevel - 1,
        StockfishController.ENGINE_SETTINGS.length - 1
      )
    );
    return StockfishController.ENGINE_SETTINGS[index];
  }

  _reconfigureEngineOptions() {
    const threads = this._isNNUEAnalysisEnabled
      ? this._calculateThreadsForNNUE()
      : 1;
    this._sendCommand(`setoption name Threads value ${threads}`);
    if (this._isNNUEAnalysisEnabled) {
      this._sendCommand("setoption name Use NNUE value true");
    } else {
      this._sendCommand("setoption name Use NNUE value false");
    }
  }

  _calculateThreadsForNNUE() {
    let threads = navigator.hardwareConcurrency;
    if (threads % 2 !== 0) {
      threads -= 1;
    }
    return threads;
  }

  _toggleEvalDepthBars(enable) {
    if (enable && !this._isEvalDepthBarsEnabled) {
      // TODO: add current centipawn eval
      document
        .getElementById("stockfish-analysis-title")
        .classList.add("hidden");
      document.getElementById("depth-progress").classList.remove("hidden");
      document
        .getElementById("eval-gauge-container")
        .classList.remove("hidden");
      document.getElementById("sidebar").style.marginLeft = "5px";
      this._isEvalDepthBarsEnabled = true;
    } else if (!enable && this._isEvalDepthBarsEnabled) {
      // TODO: remove current centipawn eval
      document
        .getElementById("stockfish-analysis-title")
        .classList.remove("hidden");
      document.getElementById("depth-progress").classList.add("hidden");
      document.getElementById("eval-gauge-container").classList.add("hidden");
      document.getElementById("sidebar").style.marginLeft = "20px";
      this._isEvalDepthBarsEnabled = false;
    }
  }

  async toggleAnalysis(enable, analysisType) {
    if (enable) {
      this._toggleEvalDepthBars(true);
      const wasNNUEEnabled = this._isNNUEAnalysisEnabled;
      const wasClassicalEnabled = this._isClassicalAnalysisEnabled;
      if (analysisType === "NNUE") {
        this._isNNUEAnalysisEnabled = enable;
        this._isClassicalAnalysisEnabled = !enable;
      } else if (analysisType === "Classical") {
        this._isClassicalAnalysisEnabled = enable;
        this._isNNUEAnalysisEnabled = !enable;
      }

      if (wasNNUEEnabled || wasClassicalEnabled) {
        this._reconfigureEngineOptions();
      }

      this.gui.clearBestMoveArrow();
      await this._ensureEngineInitialized();
      this.requestAnalysisIfNeeded();
    } else if (
      (!enable &&
        analysisType === "NNUE" &&
        !this._isClassicalAnalysisEnabled) ||
      (!enable && analysisType === "Classical" && !this._isNNUEAnalysisEnabled)
    ) {
      this._toggleEvalDepthBars(false);
      this.cleanup();
    } else if (!enable) {
      if (analysisType === "NNUE") {
        this._isNNUEAnalysisEnabled = false;
      }
      if (analysisType === "Classical") {
        this._isClassicalAnalysisEnabled = false;
      }
    }
  }

  requestAnalysisIfNeeded() {
    const newPositionHash = this._calculatePositionHash();
    if (this._shouldRequestAnalysis(newPositionHash)) {
      if (this._positionHash) {
        this._stopCurrentAnalysis();
      }
      this._bestMove = null;
      this.gui.clearBestMoveArrow();
      this._positionHash = newPositionHash;
      this._debouncer.debounce(() => this._getAnalysisMove(newPositionHash));
    } else if (this._bestMove) {
      this._addBestMoveAnalysisArrow(this._bestMove);
    }
  }

  async makeStockfishMove() {
    await this._ensureEngineInitialized();

    const { depth, moveTime } = this._getEngineSettings();
    const fen = this._calculatePositionHash();
    this._sendCommand(`position fen ${fen}`);
    this._sendCommand(`go depth ${depth} movetime ${moveTime}`);

    return new Promise((resolve) => {
      this._moveResolver = resolve;
    });
  }

  setBoardFlipped(isFlipped) {
    this._isBoardFlipped = isFlipped;
  }

  cleanup() {
    if (this._stockfish) {
      this._stockfish.terminate();
      this._stockfish = null;
    }
    this.gui.clearBestMoveArrow();
  }
}

export default StockfishController;
