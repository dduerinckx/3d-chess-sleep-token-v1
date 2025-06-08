import { ChessPiece } from './types';

export const initialBoardState: ChessPiece[] = [
  // White Pieces
  { id: 'wr1', type: 'rook', color: 'white', position: { x: 0, y: 0 }, hasMoved: false },
  { id: 'wn1', type: 'knight', color: 'white', position: { x: 1, y: 0 } },
  { id: 'wb1', type: 'bishop', color: 'white', position: { x: 2, y: 0 } },
  { id: 'wq', type: 'queen', color: 'white', position: { x: 3, y: 0 } },
  { id: 'wk', type: 'king', color: 'white', position: { x: 4, y: 0 }, hasMoved: false },
  { id: 'wb2', type: 'bishop', color: 'white', position: { x: 5, y: 0 } },
  { id: 'wn2', type: 'knight', color: 'white', position: { x: 6, y: 0 } },
  { id: 'wr2', type: 'rook', color: 'white', position: { x: 7, y: 0 }, hasMoved: false },
  { id: 'wp1', type: 'pawn', color: 'white', position: { x: 0, y: 1 }, hasMoved: false },
  { id: 'wp2', type: 'pawn', color: 'white', position: { x: 1, y: 1 }, hasMoved: false },
  { id: 'wp3', type: 'pawn', color: 'white', position: { x: 2, y: 1 }, hasMoved: false },
  { id: 'wp4', type: 'pawn', color: 'white', position: { x: 3, y: 1 }, hasMoved: false },
  { id: 'wp5', type: 'pawn', color: 'white', position: { x: 4, y: 1 }, hasMoved: false },
  { id: 'wp6', type: 'pawn', color: 'white', position: { x: 5, y: 1 }, hasMoved: false },
  { id: 'wp7', type: 'pawn', color: 'white', position: { x: 6, y: 1 }, hasMoved: false },
  { id: 'wp8', type: 'pawn', color: 'white', position: { x: 7, y: 1 }, hasMoved: false },
  
  // Black Pieces
  { id: 'br1', type: 'rook', color: 'black', position: { x: 0, y: 7 }, hasMoved: false },
  { id: 'bn1', type: 'knight', color: 'black', position: { x: 1, y: 7 } },
  { id: 'bb1', type: 'bishop', color: 'black', position: { x: 2, y: 7 } },
  { id: 'bq', type: 'queen', color: 'black', position: { x: 3, y: 7 } },
  { id: 'bk', type: 'king', color: 'black', position: { x: 4, y: 7 }, hasMoved: false },
  { id: 'bb2', type: 'bishop', color: 'black', position: { x: 5, y: 7 } },
  { id: 'bn2', type: 'knight', color: 'black', position: { x: 6, y: 7 } },
  { id: 'br2', type: 'rook', color: 'black', position: { x: 7, y: 7 }, hasMoved: false },
  { id: 'bp1', type: 'pawn', color: 'black', position: { x: 0, y: 6 }, hasMoved: false },
  { id: 'bp2', type: 'pawn', color: 'black', position: { x: 1, y: 6 }, hasMoved: false },
  { id: 'bp3', type: 'pawn', color: 'black', position: { x: 2, y: 6 }, hasMoved: false },
  { id: 'bp4', type: 'pawn', color: 'black', position: { x: 3, y: 6 }, hasMoved: false },
  { id: 'bp5', type: 'pawn', color: 'black', position: { x: 4, y: 6 }, hasMoved: false },
  { id: 'bp6', type: 'pawn', color: 'black', position: { x: 5, y: 6 }, hasMoved: false },
  { id: 'bp7', type: 'pawn', color: 'black', position: { x: 6, y: 6 }, hasMoved: false },
  { id: 'bp8', type: 'pawn', color: 'black', position: { x: 7, y: 6 }, hasMoved: false },
];
