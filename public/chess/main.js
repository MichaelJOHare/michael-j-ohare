import GameController from "./controller/GameController.js";

const gameController = new GameController();

/*
TO DO
 - Implement captured pieces/material advantage
 - Fix king check highlight after promotion after reset game ??

 - Make drawing arrow/circle over pre-existing arrow/circle remove it.

 - Go through and change private fields to normal, remove getters.
     -Thought it was a good idea, not liking it now.  Maybe keep setters?  They make sense in my brain
 - Make move piece with click a smooth glide to location
      - Add sounds
 - Implement play vs stockfish.  Modal, if play vs -> select ELO or skill level.  Remove import from FEN/SF analysis
        - If player selects black, auto flip board
 
 - Implement PGN box
*/
