import GameController from "./controller/GameController.js";

const gameController = new GameController();

/*
TO DO
 - Fix chessboard-wrapper width on mobile

 - Make drawing arrow/circle over pre-existing arrow/circle remove it.

 - Refactor promotion selector, lots of repeated code
          -- Maybe redo chessboard highlighter to use SVG for highlighting like drawArrow/Circle

 - Go through and change private fields to normal, remove getters.
     -Thought it was a good idea, not liking it now.  Maybe keep setters?  They make sense in my brain
 - Make move piece with click a smooth glide to location
      - Add onTouchMove, maybe sounds, etc.
 - Implement drawing arrows/circles with right click
 - Implement stockfish/misc UI (maybe PGN box)
*/
