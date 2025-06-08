import { Move, Position, GameState } from '../models/types';

// Convert position to algebraic notation (e.g., e4)
export const positionToAlgebraic = (position: Position): string => {
  const file = String.fromCharCode(97 + position.x); // 'a' to 'h'
  const rank = position.y + 1; // 1 to 8
  return `${file}${rank}`;
};

// Format move in algebraic chess notation
export const formatMove = (
  move: Move,
  previousMoves: Move[],
  gameState: GameState | null = null
): string => {
  const from = positionToAlgebraic(move.from);
  const to = positionToAlgebraic(move.to);
  let notation = '';
  
  // Castling
  if (move.piece.type === 'king' && Math.abs(move.from.x - move.to.x) === 2) {
    notation = move.to.x > move.from.x ? 'O-O' : 'O-O-O';
  } else {
    // Piece symbol
    if (move.piece.type !== 'pawn') {
      const pieceSymbols: Record<string, string> = {
        king: 'K',
        queen: 'Q',
        rook: 'R',
        bishop: 'B',
        knight: 'N',
      };
      notation = pieceSymbols[move.piece.type];
      
      // Disambiguate if necessary (if two pieces of the same type can move to the same square)
      const otherPieces = previousMoves
        .filter((m) => m.piece.type === move.piece.type && m.piece.color === move.piece.color)
        .map((m) => m.piece);
      
      if (otherPieces.length > 0) {
        const needsFileDisambiguation = otherPieces.some((p) => p.position.y === move.from.y);
        const needsRankDisambiguation = otherPieces.some((p) => p.position.x === move.from.x);
        
        if (needsFileDisambiguation) {
          notation += from[0]; // Add file (a-h)
        }
        
        if (needsRankDisambiguation) {
          notation += from[1]; // Add rank (1-8)
        }
      }
    }
    
    // Capture
    if (move.capturedPiece) {
      if (move.piece.type === 'pawn') {
        notation += from[0]; // Add file for pawn captures
      }
      notation += 'x';
    }
    
    // Destination square
    notation += to;
    
    // Promotion
    if (move.isPromotion) {
      notation += `=${move.promotedTo?.toUpperCase()}`; // e.g., =Q
    }
  }
  
  // Check or checkmate
  if (gameState === 'checkmate') {
    notation += '#';
  } else if (gameState === 'check') {
    notation += '+';
  }
  
  return notation;
};
