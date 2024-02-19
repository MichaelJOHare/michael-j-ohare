import PlayOrAnalysisModal from "./view/setup/PlayOrAnalysisModal.js";

const playOrAnalysisModal = new PlayOrAnalysisModal();

/*
TO DO
 - Test stockfish castling/promotion/en passant (have seen promotion and castling work)

 - Fix king check highlight after promotion after reset game ??

 - Show current depth/sf advantage in analysis mode
 - Implement captured pieces/material advantage

 - Make drawing arrow/circle over pre-existing arrow/circle remove it.
       - make dragging div x + squareSize on mobile and width/height bigger to account for finger occluding view

 - Refactor private fields/methods vs public ones (large scale. sfController as model)

 - Make move piece with click a smooth glide to location
      - Add sounds

 - Implement if play vs stockfish -> if player selects black, auto flip board
       - Make close button an x in top right of modal, make play button green
 
 - Implement PGN box
*/
