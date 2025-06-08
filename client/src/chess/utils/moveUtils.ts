import { ChessPiece, Position, Move } from '../models/types';

// Get all possible moves for a piece
export const getPieceMoves = (
  piece: ChessPiece,
  boardState: ChessPiece[],
  moveHistory: Move[]
): Position[] => {
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(piece, boardState, moveHistory);
    case 'knight':
      return getKnightMoves(piece, boardState);
    case 'bishop':
      return getBishopMoves(piece, boardState);
    case 'rook':
      return getRookMoves(piece, boardState);
    case 'queen':
      return getQueenMoves(piece, boardState);
    case 'king':
      return getKingMoves(piece, boardState, moveHistory);
    default:
      return [];
  }
};

// Helper function to check if a position is on the board
const isOnBoard = (position: Position): boolean => {
  return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
};

// Helper function to check if a position is occupied by a piece of a specific color
const isOccupiedByColor = (
  position: Position,
  boardState: ChessPiece[],
  color: string | null
): boolean => {
  const piece = boardState.find(
    (p) => p.position.x === position.x && p.position.y === position.y
  );
  
  if (!piece) return false;
  if (color === null) return true;
  return piece.color === color;
};

// Get pawn moves
const getPawnMoves = (
  piece: ChessPiece,
  boardState: ChessPiece[],
  moveHistory: Move[]
): Position[] => {
  const moves: Position[] = [];
  const direction = piece.color === 'white' ? 1 : -1;
  
  // Forward move
  const forwardPosition = { x: piece.position.x, y: piece.position.y + direction };
  if (
    isOnBoard(forwardPosition) &&
    !isOccupiedByColor(forwardPosition, boardState, null)
  ) {
    moves.push(forwardPosition);
    
    // Double forward move from starting position
    if (!piece.hasMoved) {
      const doubleForwardPosition = {
        x: piece.position.x,
        y: piece.position.y + direction * 2,
      };
      
      if (
        isOnBoard(doubleForwardPosition) &&
        !isOccupiedByColor(doubleForwardPosition, boardState, null)
      ) {
        moves.push(doubleForwardPosition);
      }
    }
  }
  
  // Captures (diagonal moves)
  const capturePositions = [
    { x: piece.position.x - 1, y: piece.position.y + direction },
    { x: piece.position.x + 1, y: piece.position.y + direction },
  ];
  
  capturePositions.forEach((position) => {
    if (
      isOnBoard(position) &&
      isOccupiedByColor(position, boardState, piece.color === 'white' ? 'black' : 'white')
    ) {
      moves.push(position);
    }
  });
  
  // En passant
  if (moveHistory.length > 0) {
    const lastMove = moveHistory[moveHistory.length - 1];
    
    if (
      lastMove.piece.type === 'pawn' &&
      Math.abs(lastMove.from.y - lastMove.to.y) === 2 &&
      lastMove.to.y === piece.position.y &&
      Math.abs(lastMove.to.x - piece.position.x) === 1
    ) {
      moves.push({
        x: lastMove.to.x,
        y: piece.position.y + direction,
      });
    }
  }
  
  return moves;
};

// Get knight moves
const getKnightMoves = (piece: ChessPiece, boardState: ChessPiece[]): Position[] => {
  const moves: Position[] = [];
  const knightMoves = [
    { x: 1, y: 2 },
    { x: 2, y: 1 },
    { x: 2, y: -1 },
    { x: 1, y: -2 },
    { x: -1, y: -2 },
    { x: -2, y: -1 },
    { x: -2, y: 1 },
    { x: -1, y: 2 },
  ];
  
  knightMoves.forEach((move) => {
    const newPosition = {
      x: piece.position.x + move.x,
      y: piece.position.y + move.y,
    };
    
    if (
      isOnBoard(newPosition) &&
      !isOccupiedByColor(newPosition, boardState, piece.color)
    ) {
      moves.push(newPosition);
    }
  });
  
  return moves;
};

// Get bishop moves
const getBishopMoves = (piece: ChessPiece, boardState: ChessPiece[]): Position[] => {
  const moves: Position[] = [];
  const directions = [
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
  ];
  
  directions.forEach((direction) => {
    for (let i = 1; i < 8; i++) {
      const newPosition = {
        x: piece.position.x + direction.x * i,
        y: piece.position.y + direction.y * i,
      };
      
      if (!isOnBoard(newPosition)) break;
      
      if (!isOccupiedByColor(newPosition, boardState, null)) {
        moves.push(newPosition);
      } else {
        if (isOccupiedByColor(newPosition, boardState, piece.color === 'white' ? 'black' : 'white')) {
          moves.push(newPosition);
        }
        break;
      }
    }
  });
  
  return moves;
};

// Get rook moves
const getRookMoves = (piece: ChessPiece, boardState: ChessPiece[]): Position[] => {
  const moves: Position[] = [];
  const directions = [
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
  ];
  
  directions.forEach((direction) => {
    for (let i = 1; i < 8; i++) {
      const newPosition = {
        x: piece.position.x + direction.x * i,
        y: piece.position.y + direction.y * i,
      };
      
      if (!isOnBoard(newPosition)) break;
      
      if (!isOccupiedByColor(newPosition, boardState, null)) {
        moves.push(newPosition);
      } else {
        if (isOccupiedByColor(newPosition, boardState, piece.color === 'white' ? 'black' : 'white')) {
          moves.push(newPosition);
        }
        break;
      }
    }
  });
  
  return moves;
};

// Get queen moves (combination of bishop and rook moves)
const getQueenMoves = (piece: ChessPiece, boardState: ChessPiece[]): Position[] => {
  return [...getBishopMoves(piece, boardState), ...getRookMoves(piece, boardState)];
};

// Get king moves
const getKingMoves = (
  piece: ChessPiece,
  boardState: ChessPiece[],
  moveHistory: Move[]
): Position[] => {
  const moves: Position[] = [];
  const kingMoves = [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
  ];
  
  // Regular king moves
  kingMoves.forEach((move) => {
    const newPosition = {
      x: piece.position.x + move.x,
      y: piece.position.y + move.y,
    };
    
    if (
      isOnBoard(newPosition) &&
      !isOccupiedByColor(newPosition, boardState, piece.color)
    ) {
      moves.push(newPosition);
    }
  });
  
  // Castling
  if (!piece.hasMoved) {
    // Kingside castling
    const kingsideRook = boardState.find(
      (p) =>
        p.type === 'rook' &&
        p.color === piece.color &&
        p.position.x === 7 &&
        p.position.y === piece.position.y &&
        !p.hasMoved
    );
    
    if (kingsideRook) {
      const isPathClear = [1, 2].every(
        (offset) =>
          !isOccupiedByColor(
            { x: piece.position.x + offset, y: piece.position.y },
            boardState,
            null
          )
      );
      
      if (isPathClear) {
        moves.push({
          x: piece.position.x + 2,
          y: piece.position.y,
        });
      }
    }
    
    // Queenside castling
    const queensideRook = boardState.find(
      (p) =>
        p.type === 'rook' &&
        p.color === piece.color &&
        p.position.x === 0 &&
        p.position.y === piece.position.y &&
        !p.hasMoved
    );
    
    if (queensideRook) {
      const isPathClear = [-1, -2, -3].every(
        (offset) =>
          !isOccupiedByColor(
            { x: piece.position.x + offset, y: piece.position.y },
            boardState,
            null
          )
      );
      
      if (isPathClear) {
        moves.push({
          x: piece.position.x - 2,
          y: piece.position.y,
        });
      }
    }
  }
  
  return moves;
};
