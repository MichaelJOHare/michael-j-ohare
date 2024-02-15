import GameController from "./controller/GameController.js";

const gameController = new GameController();

/*
TO DO
 - Fix stockfish best move arrow drawn after moving during analysis
 - Optimize FENGenerator further (castling availability?)

 - Make drawing arrow/circle over pre-existing arrow/circle remove it.

 - Go through and change private fields to normal, remove getters.
     -Thought it was a good idea, not liking it now.  Maybe keep setters?  They make sense in my brain
 - Make move piece with click a smooth glide to location
      - Add sounds
 - Implement play vs stockfish and PGN box
*/
