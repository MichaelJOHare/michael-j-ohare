import FENGenerator from "../utils/FENGenerator.js";
import Debouncer from "../utils/Debouncer.js";

class StockfishController {
  constructor(board, move, gameState, gui) {
    this.board = board;
    this.move = move;
    this.gameState = gameState;
    this.gui = gui;

    this.debouncer = new Debouncer(300);
    this.isContinuousAnalysisEnabled = false;
    this.isClassicalContinuousAnalysisEnabled = false;

    this.lastCommand = "";
    this.lastArrowUpdate = Date.now();
    this.lastDepthUpdated = 0;
    this.updateInterval = 3000;
    this.depthInterval = 5;

    this.positionHash;
    this.bestMove;
  }

  initEngine() {
    this.sendCommand("uci");
  }

  sendCommand(command) {
    this.lastCommand = command;
    this.stockfish.postMessage(command);
  }

  handleStockfishMessage(event) {
    console.log("Stockfish says: ", event.data);
    if (event.data.startsWith("info depth")) {
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
      if (this.lastCommand !== "stop") {
        const bestMove = event.data.split(" ")[1];
        this.bestMove = bestMove;
        this.addBestMoveAnalysisArrow(bestMove);
        this.lastDepthUpdated = 0;
        this.lastArrowUpdate = Date.now();
      }
    }
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

  getMove(fen) {
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand("go depth 20");
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
      this.initEngine();
    }
  }

  cleanUp() {
    this.sendCommand("stop");
    this.gui.clearBestMoveArrow();
  }
}

export default StockfishController;
