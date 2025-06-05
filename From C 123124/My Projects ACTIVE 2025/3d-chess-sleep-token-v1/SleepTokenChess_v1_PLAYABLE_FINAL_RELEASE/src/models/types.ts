export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';
export type GameState = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export interface Position {
  x: number;
  y: number;
}

export interface ChessPiece {
  id: string;
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved?: boolean;
}

export interface Move {
  piece: ChessPiece;
  from: Position;
  to: Position;
  capturedPiece?: ChessPiece;
  isPromotion?: boolean;
  promotedTo?: PieceType;
  isCastling?: boolean;
  isEnPassant?: boolean;
  timestamp: Date;
}