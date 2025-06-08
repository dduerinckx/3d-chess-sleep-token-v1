import React from 'react';
import BoardSquare from './BoardSquare';
import ChessPiece from './ChessPiece';
import { ChessPiece as ChessPieceType, Position } from '../models/types';

interface ChessBoardProps {
  boardState: ChessPieceType[];
  selectedPiece: ChessPieceType | null;
  validMoves: Position[];
  onSquareClick: (position: Position) => void;
  checkState: { white: boolean; black: boolean };
}

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  boardState, 
  selectedPiece, 
  validMoves, 
  onSquareClick,
  checkState
}) => {
  // Create the chess board
  const renderSquares = () => {
    const squares = [];
    
    for (let y = 7; y >= 0; y--) {
      for (let x = 0; x < 8; x++) {
        const position = { x, y };
        const piece = boardState.find(
          (p) => p.position.x === x && p.position.y === y
        );
        
        const isSelected = selectedPiece?.position.x === x && selectedPiece?.position.y === y;
        const isValidMove = validMoves.some((move) => move.x === x && move.y === y);
        const isCheck = piece?.type === 'king' && checkState[piece.color];
        
        squares.push(
          <BoardSquare
            key={`${x}-${y}`}
            position={position}
            isLight={(x + y) % 2 === 0}
            isSelected={isSelected}
            isValidMove={isValidMove}
            isCheck={isCheck}
            onClick={() => onSquareClick(position)}
          >
            {piece && (
              <ChessPiece piece={piece} />
            )}
          </BoardSquare>
        );
      }
    }
    
    return squares;
  };

  // Add column and row labels
  const renderLabels = () => {
    const colLabels = [];
    const rowLabels = [];
    
    // Column labels (a-h)
    for (let x = 0; x < 8; x++) {
      colLabels.push(
        <div key={`col-${x}`} className="text-center text-sm font-medium text-amber-800">
          {String.fromCharCode(97 + x)}
        </div>
      );
    }
    
    // Row labels (1-8)
    for (let y = 7; y >= 0; y--) {
      rowLabels.push(
        <div key={`row-${y}`} className="flex items-center justify-center h-16 text-sm font-medium text-amber-800">
          {y + 1}
        </div>
      );
    }
    
    return { colLabels, rowLabels };
  };

  const { colLabels, rowLabels } = renderLabels();

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-amber-900">Chess Game</h1>
      <div className="flex">
        <div className="mr-4">
          <div className="h-8"></div> {/* Spacer to align with board */}
          <div className="flex flex-col">
            {rowLabels}
          </div>
        </div>
        <div>
          <div className="grid grid-cols-8 gap-1 mb-2">
            {colLabels}
          </div>
          <div className="grid grid-cols-8 border-8 border-amber-900 rounded-lg shadow-2xl overflow-hidden w-[36rem] h-[36rem]">
            {renderSquares()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
