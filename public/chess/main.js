import PlayOrAnalysisModal from "./view/setup/PlayOrAnalysisModal.js";

const playOrAnalysisModal = new PlayOrAnalysisModal();

/*
TO DO
Fixed
 - Test proper state reset after:
      - reset (analysis?) game -> move -> drag piece while stockfish move -> showing previous game state while stockfish moves

Fixed
 - Test stockfish castling/promotion/en passant (have seen promotion and castling work)

Fixed
 - Fix stockfish bestmove (none) after checkmate processBestMove

 - Show current depth/sf advantage in analysis mode
 - Implement captured pieces/material advantage

 - Make drawing arrow/circle over pre-existing arrow/circle remove it.
       - Fix arrows/circles being drawn more than once
       - make dragging div x + squareSize on mobile and width/height bigger to account for finger occluding view

 - Refactor private fields/methods vs public ones (large scale. sfController as model)

 - Make move piece with click a smooth glide to location
      - Add sounds

 - Implement if play vs stockfish -> if player selects black, auto flip board
       - Make close button an x in top right of modal, make play button green
 
 - Implement PGN box
*/
