import PlayOrAnalysisModal from "./view/setup/PlayOrAnalysisModal.js";

const playOrAnalysisModal = new PlayOrAnalysisModal();

/*
TO DO
 - Fix best move arrow drawn after move during analysis (replace if lastCommand === "stop" conditional)
              - fix best move arrow removed when switching between analysis types
                     - FIX stockfish initialized twice switching analysis types
 -Finish implementing stockfish castling/promotion/en passant
 - Implement captured pieces/material advantage

 - Fix king check highlight after promotion after reset game ??

 - Show current depth/sf advantage in analysis mode

 - Make drawing arrow/circle over pre-existing arrow/circle remove it.

 - Go through and change private fields to normal, remove getters.
     -Thought it was a good idea, not liking it now.  Maybe keep setters?  They make sense in my brain
 - Make move piece with click a smooth glide to location
      - Add sounds
 - Implement if play vs stockfish -> if player selects black, auto flip board
 
 - Implement PGN box
*/
