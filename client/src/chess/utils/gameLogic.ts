import { ChessPiece, Position, Move, PieceColor, PieceType } from '../models/types';
import { getPieceMoves } from './moveUtils';

// Check if a move is valid
export const isValidMove = (
  piece: ChessPiece,
  targetPosition: Position,
  boardState: ChessPiece[],
  moveHistory: Move[]
): boolean => {
  // Can't move to the same position
  if (piece.position.x === targetPosition.x && piece.position.y === targetPosition.y) {
    return false;
  }

  // Can't capture own pieces
  const pieceAtTarget = boardState.find(
    (p) => p.position.x === targetPosition.x && p.position.y === targetPosition.y
  );
  if (pieceAtTarget && pieceAtTarget.color === piece.color) {
    return false;
  }

  // Get valid moves for the piece
  const validMoves = getPieceMoves(piece, boardState, moveHistory);
  
  // Check if target position is in valid moves
  return validMoves.some(
    (move) => move.x === targetPosition.x && move.y === targetPosition.y
  );
};

// Make a move
export const makeMove = (
  piece: ChessPiece,
  targetPosition: Position,
  boardState: ChessPiece[]
): ChessPiece[] => {
  const newBoardState = [...boardState];
  
  // Find the piece to move
  const pieceToMove = newBoardState.find((p) => p.id === piece.id);
  if (!pieceToMove) return newBoardState;
  
  // Check for capture
  const captureIndex = newBoardState.findIndex(
    (p) => p.position.x === targetPosition.x && p.position.y === targetPosition.y
  );
  
  // Remove captured piece
  if (captureIndex !== -1) {
    newBoardState.splice(captureIndex, 1);
  }
  
  // Handle en passant capture
  if (pieceToMove.type === 'pawn') {
    const isEnPassant = Math.abs(pieceToMove.position.x - targetPosition.x) === 1 && 
                        Math.abs(pieceToMove.position.y - targetPosition.y) === 1 && 
                        !newBoardState.some(p => 
                          p.position.x === targetPosition.x && 
                          p.position.y === targetPosition.y
                        );
    
    if (isEnPassant) {
      const capturedPawnIndex = newBoardState.findIndex(
        (p) => p.position.x === targetPosition.x && p.position.y === pieceToMove.position.y
      );
      
      if (capturedPawnIndex !== -1) {
        newBoardState.splice(capturedPawnIndex, 1);
      }
    }
  }
  
  // Handle castling
  if (pieceToMove.type === 'king' && !pieceToMove.hasMoved) {
    const isQueensideCastle = targetPosition.x === pieceToMove.position.x - 2;
    const isKingsideCastle = targetPosition.x === pieceToMove.position.x + 2;
    
    if (isQueensideCastle || isKingsideCastle) {
      // Move the rook
      const rookX = isQueensideCastle ? 0 : 7;
      const rookTargetX = isQueensideCastle ? targetPosition.x + 1 : targetPosition.x - 1;
      
      const rookIndex = newBoardState.findIndex(
        (p) => p.type === 'rook' && p.color === pieceToMove.color && p.position.x === rookX && p.position.y === pieceToMove.position.y
      );
      
      if (rookIndex !== -1) {
        newBoardState[rookIndex].position.x = rookTargetX;
        newBoardState[rookIndex].hasMoved = true;
      }
    }
  }
  
  // Move the piece
  pieceToMove.position = { ...targetPosition };
  
  // Set hasMoved flag for relevant pieces
  if (pieceToMove.type === 'king' || pieceToMove.type === 'rook' || pieceToMove.type === 'pawn') {
    pieceToMove.hasMoved = true;
  }
  
  // Handle pawn promotion (auto-promote to queen for simplicity)
  if (pieceToMove.type === 'pawn') {
    const promotionRank = pieceToMove.color === 'white' ? 7 : 0;
    if (targetPosition.y === promotionRank) {
      pieceToMove.type = 'queen';
    }
  }
  
  return newBoardState;
};

// Check if a king is in check
export const isCheck = (boardState: ChessPiece[], color: PieceColor): boolean => {
  // Find the king
  const king = boardState.find((piece) => piece.type === 'king' && piece.color === color);
  if (!king) return false;
  
  // Get all opponent pieces
  const opponentPieces = boardState.filter((piece) => piece.color !== color);
  
  // Check if any opponent piece can capture the king
  return opponentPieces.some((piece) => {
    const validMoves = getPieceMoves(piece, boardState, []);
    return validMoves.some(
      (move) => move.x === king.position.x && move.y === king.position.y
    );
  });
};

// Check if a player is in checkmate
export const isCheckmate = (
  boardState: ChessPiece[],
  color: PieceColor,
  moveHistory: Move[]
): boolean => {
  // If not in check, it's not checkmate
  if (!isCheck(boardState, color)) return false;
  
  // Get all pieces of the current player
  const pieces = boardState.filter((piece) => piece.color === color);
  
  // Check if any piece has a valid move that gets out of check
  return !pieces.some((piece) => {
    const validMoves = getPieceMoves(piece, boardState, moveHistory);
    
    return validMoves.some((move) => {
      // Try the move and see if it gets out of check
      const newBoardState = makeMove(piece, move, boardState);
      return !isCheck(newBoardState, color);
    });
  });
};

// Check if a player is in stalemate
export const isStalemate = (
  boardState: ChessPiece[],
  color: PieceColor,
  moveHistory: Move[]
): boolean => {
  // If in check, it's not stalemate
  if (isCheck(boardState, color)) return false;
  
  // Get all pieces of the current player
  const pieces = boardState.filter((piece) => piece.color === color);
  
  // Check if any piece has a valid move
  return !pieces.some((piece) => {
    const validMoves = getPieceMoves(piece, boardState, moveHistory);
    
    return validMoves.some((move) => {
      // Try the move and see if it leaves the king in check
      const newBoardState = makeMove(piece, move, boardState);
      return !isCheck(newBoardState, color);
    });
  });
};
