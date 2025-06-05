import React from 'react';
import MoveHistory from './MoveHistory';
import { PieceColor, GameState, Move } from '../models/types';
import { formatMove } from '../utils/notationUtils';

interface GameInfoProps {
  currentPlayer: PieceColor;
  gameState: GameState;
  moveHistory: Move[];
  onResetGame: () => void;
  checkState: { white: boolean; black: boolean };
}

const GameInfo: React.FC<GameInfoProps> = ({
  currentPlayer,
  gameState,
  moveHistory,
  onResetGame,
  checkState,
}) => {
  const getGameStatus = () => {
    if (gameState === 'checkmate') {
      const winner = currentPlayer === 'white' ? 'Black' : 'White';
      return `Checkmate! ${winner} wins!`;
    } else if (gameState === 'stalemate') {
      return 'Stalemate! The game is a draw.';
    } else {
      return `${currentPlayer === 'white' ? 'White' : 'Black'}'s turn`;
    }
  };

  const getStatusColor = () => {
    if (gameState === 'checkmate') {
      return 'text-red-500';
    } else if (gameState === 'stalemate') {
      return 'text-amber-500';
    } else if (checkState[currentPlayer]) {
      return 'text-red-500';
    } else {
      return 'text-amber-900';
    }
  };

  const formattedMoves = moveHistory.map((move, index) => ({
    number: Math.floor(index / 2) + 1,
    color: move.piece.color,
    notation: formatMove(move, moveHistory.slice(0, index), gameState),
  }));

  return (
    <div className="bg-amber-50 rounded-lg shadow-xl p-8 w-96">
      <h2 className="text-3xl font-bold text-amber-900 mb-6">Game Info</h2>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-amber-900">Status:</span>
          <span className={`text-lg font-bold ${getStatusColor()}`}>
            {getGameStatus()}
            {gameState === 'playing' && checkState[currentPlayer] && ' (Check)'}
          </span>
        </div>
        
        <div className="flex items-center mb-6">
          <div className={`w-6 h-6 rounded-full mr-3 ${currentPlayer === 'white' ? 'bg-white border-2 border-black' : 'bg-black'}`}></div>
          <span className="text-lg font-bold text-amber-900">{currentPlayer === 'white' ? 'White' : 'Black'} to move</span>
        </div>
        
        <button
          onClick={onResetGame}
          className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white text-lg font-bold rounded-lg transition-colors duration-200"
        >
          New Game
        </button>
      </div>
      
      <MoveHistory moves={formattedMoves} />
    </div>
  );
};

export default GameInfo;