import FENGenerator from "../utils/FENGenerator.js";
import Debouncer from "../utils/Debouncer.js";
import Move from "../model/moves/Move.js";
import Square from "../model/board/Square.js";

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

  constructor(board, move, gameState, gui, strengthLevel) {
    this.board = board;
    this.move = move;
    this.gameState = gameState;
    this.gui = gui;
    this.strengthLevel = strengthLevel;

    this.debouncer = new Debouncer(300);
    this.isContinuousAnalysisEnabled = false;
    this.isClassicalContinuousAnalysisEnabled = false;

    this.lastCommand = "";
    this.lastArrowUpdate = Date.now();
    this.lastDepthUpdated = 0;
    this.updateInterval = 3000;
    this.depthInterval = 5;

    this.positionHash;
    this.bestMove = null;
  }

  initEngine(isPlaying) {
    this.sendCommand("uci");
    if (isPlaying) {
      const skill = this.getEngineSettings().skill;
      this.sendCommand(`setoption name Skill Level value ${skill}`);
      this.sendCommand("ucinewgame");
      this.sendCommand("isready");
    }
  }

  sendCommand(command) {
    console.log(command);
    this.lastCommand = command;
    this.stockfish.postMessage(command);
  }

  getMove(fen) {
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand(`go depth ${StockfishController.DEFAULT_DEPTH}`);
  }

  getStockfishAsOpponentMove() {
    return new Promise((resolve) => {
      this.ensureEngineInitialized();

      const { depth, moveTime } = this.getEngineSettings();
      const fen = this.calculatePositionHash();
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${depth} movetime ${moveTime}`);

      const handleBestMove = (event) => {
        if (event.data.startsWith("bestmove")) {
          const bestMoveStr = event.data.split(" ")[1];
          this.stockfish.removeEventListener("message", handleBestMove);
          const move = this.processBestMove(bestMoveStr);
          resolve(move);
        }
      };

      this.stockfish.addEventListener("message", handleBestMove);
    });
  }

  handleStockfishMessage(event) {
    console.log(event.data);
    if (event.data.startsWith("info depth") && this.strengthLevel === 0) {
      const depth = parseInt(event.data.split(" ")[2]);
      const currentTime = Date.now();
      if (
        depth === 1 ||
        (depth - this.lastDepthUpdated >= this.depthInterval &&
          currentTime - this.lastArrowUpdate >= this.updateInterval)
      ) {
        const moveData = event.data.match(/pv (\w{2}\w{2})/);
        if (moveData) {
          this.updateTemporaryAnalysisArrow(moveData[1]);
          this.lastDepthUpdated = depth;
          this.lastArrowUpdate = currentTime;
        }
      }
    }

    if (event.data.startsWith("bestmove")) {
      const bestMove = event.data.split(" ")[1];
      if (this.strengthLevel > 0 || this.strengthLevel < 0) {
        this.processBestMove(bestMove);
      } else if (this.strengthLevel === 0) {
        if (this.lastCommand !== "stop") {
          this.bestMove = bestMove;
          this.addBestMoveAnalysisArrow(bestMove);
          this.lastDepthUpdated = 0;
          this.lastArrowUpdate = Date.now();
        }
      }
    }
  }

  onReady() {
    // Handle ready state
  }

  onBestMove(data) {
    // Process best move here
  }

  toggleContinuousAnalysis(enable) {
    this.isContinuousAnalysisEnabled = enable;
    if (enable) {
      this.gui.clearBestMoveArrow();
      this.ensureEngineInitialized();
      this.sendCommand("setoption name Use NNUE value true");
      this.sendCommand("ucinewgame");
      this.sendCommand("isready");
      this.requestAnalysisIfNeeded();
    } else if (!enable && !this.isClassicalContinuousAnalysisEnabled) {
      this.cleanUp();
    }
  }

  toggleClassicalContinuousAnalysis(enable) {
    this.isClassicalContinuousAnalysisEnabled = enable;
    if (enable) {
      this.gui.clearBestMoveArrow();
      this.ensureEngineInitialized();
      this.sendCommand("ucinewgame");
      this.sendCommand("isready");
      this.requestAnalysisIfNeeded();
    } else if (!enable && !this.isContinuousAnalysisEnabled) {
      this.cleanUp();
    }
  }

  requestAnalysisIfNeeded() {
    const newPositionHash = this.calculatePositionHash();
    if (
      (this.isContinuousAnalysisEnabled ||
        this.isClassicalContinuousAnalysisEnabled) &&
      newPositionHash !== this.positionHash
    ) {
      this.stopCurrentAnalysis();
      this.gui.clearBestMoveArrow();
      this.positionHash = newPositionHash;
      this.debouncer.debounce(() => this.getMove(newPositionHash));
    } else if (this.bestMove) {
      this.addBestMoveAnalysisArrow(this.bestMove);
    }
  }

  processBestMove(bestMoveStr) {
    const fromNotation = bestMoveStr.substring(0, 2);
    const toNotation = bestMoveStr.substring(2, 4);

    const fromRowCol = this.convertNotationToSquare(fromNotation);
    const fromSquare = new Square(fromRowCol.row, fromRowCol.col);
    const toRowCol = this.convertNotationToSquare(toNotation);
    const toSquare = new Square(toRowCol.row, toRowCol.col);

    const movingPiece = this.board.getPieceAt(fromRowCol.row, fromRowCol.col);
    const capturedPiece = this.board.getPieceAt(toRowCol.row, toRowCol.col);

    return new Move(
      movingPiece,
      fromSquare,
      toSquare,
      capturedPiece,
      this.board
    );
  }

  updateTemporaryAnalysisArrow(moveData) {
    const fromSquare = moveData.substring(0, 2);
    const toSquare = moveData.substring(2, 4);
    this.addTemporaryAnalysisArrow(fromSquare, toSquare);
  }

  addTemporaryAnalysisArrow(fromSquare, toSquare) {
    const from = this.convertNotationToSquare(fromSquare);
    const to = this.convertNotationToSquare(toSquare);

    this.gui.handleAnalysisArrow(from, to);
  }

  addBestMoveAnalysisArrow(bestMove) {
    const fromSquare = bestMove.substring(0, 2);
    const toSquare = bestMove.substring(2, 4);

    const from = this.convertNotationToSquare(fromSquare);
    const to = this.convertNotationToSquare(toSquare);

    this.gui.handleBestMoveArrow(from, to);
  }

  calculatePositionHash() {
    return FENGenerator.toFEN(this.board, this.move, this.gameState);
  }

  convertNotationToSquare(notation) {
    const col = notation.charCodeAt(0) - "a".charCodeAt(0);
    const row = 8 - parseInt(notation[1]);

    return { row, col };
  }

  stopCurrentAnalysis() {
    this.sendCommand("stop");
  }

  ensureEngineInitialized() {
    if (!this.stockfish) {
      this.stockfish = new Worker("/chess/stockfish/stockfish-nnue-16.js");
      this.stockfish.onmessage = this.handleStockfishMessage.bind(this);
      if (this.strengthLevel === 0) {
        this.initEngine(false);
      } else {
        this.initEngine(true);
      }
    }
  }

  getEngineSettings() {
    return StockfishController.ENGINE_SETTINGS[
      Math.max(
        0,
        Math.min(
          this.strengthLevel - 1,
          StockfishController.ENGINE_SETTINGS.length - 1
        )
      )
    ];
  }

  cleanUp() {
    if (this.stockfish) {
      this.stockfish.removeEventListener(
        "message",
        this.handleStockfishMessage
      );
      // Add any other removeEventListener calls as needed
    }
    this.stockfish = null;
    this.gui.clearBestMoveArrow();
  }
}

export default StockfishController;
