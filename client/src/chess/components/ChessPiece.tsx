import React from 'react';
import { ChessPiece as ChessPieceType } from '../models/types';
import { Crown, Castle, Cross, ChevronUp, Users as Horse, Check as Chess } from 'lucide-react';

interface ChessPieceProps {
  piece: ChessPieceType;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece }) => {
  const color = piece.color === 'white' ? 'text-white' : 'text-black';
  const strokeColor = piece.color === 'white' ? 'stroke-black' : 'stroke-white';
  const baseClass = `w-12 h-12 ${color} ${strokeColor} stroke-2 transition-transform duration-200 transform hover:scale-110`;

  const renderPiece = () => {
    switch (piece.type) {
      case 'king':
        return <Crown className={baseClass} />;
      case 'queen':
        return <Chess className={baseClass} />;
      case 'rook':
        return <Castle className={baseClass} />;
      case 'bishop':
        return <Cross className={baseClass} />;
      case 'knight':
        return <Horse className={baseClass} />;
      case 'pawn':
        return <ChevronUp className={baseClass} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="flex items-center justify-center w-full h-full"
      data-piece-type={piece.type}
      data-piece-color={piece.color}
    >
      {renderPiece()}
    </div>
  );
};

export default ChessPiece;
