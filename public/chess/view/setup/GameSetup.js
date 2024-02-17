import Player from "../../model/player/Player.js";
import PlayerColor from "../../model/player/PlayerColor.js";
import PlayerType from "../../model/player/PlayerType.js";

class GameSetup {
  constructor() {
    this.isAnalysisGame = false;
    this.isVsComputerGame = false;
    this.colorSelection = null;
  }

  setupPlayers(isAnalysis, isVsComputer, colorSelection) {
    this.isAnalysisGame = isAnalysis;
    this.isVsComputerGame = isVsComputer;
    this.colorSelection = colorSelection;

    if (this.isAnalysisGame) {
      const player1 = new Player(PlayerColor.WHITE, PlayerType.HUMAN);
      const player2 = new Player(PlayerColor.BLACK, PlayerType.HUMAN);
      return { player1, player2 };
    } else if (this.isVsComputerGame) {
      if (colorSelection === PlayerColor.WHITE) {
        const player1 = new Player(PlayerColor.WHITE, PlayerType.HUMAN);
        const player2 = new Player(PlayerColor.BLACK, PlayerType.AI);
        return { player1, player2 };
      } else {
        const player1 = new Player(PlayerColor.WHITE, PlayerType.AI);
        const player2 = new Player(PlayerColor.BLACK, PlayerType.HUMAN);
        return { player1, player2 };
      }
    }
  }
}

export default GameSetup;
