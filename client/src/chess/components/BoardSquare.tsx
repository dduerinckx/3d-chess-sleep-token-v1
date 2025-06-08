import React from 'react';
import { Position } from '../models/types';

interface BoardSquareProps {
  position: Position;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isCheck: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const BoardSquare: React.FC<BoardSquareProps> = ({
  position,
  isLight,
  isSelected,
  isValidMove,
  isCheck,
  onClick,
  children,
}) => {
  const baseClass = isLight
    ? 'bg-amber-200 hover:bg-amber-300'
    : 'bg-amber-700 hover:bg-amber-800';
  
  let additionalClass = '';
  
  if (isSelected) {
    additionalClass = 'ring-4 ring-blue-400 z-10';
  } else if (isValidMove) {
    additionalClass = 'after:content-[""] after:absolute after:inset-0 after:m-auto after:w-1/3 after:h-1/3 after:bg-green-500 after:rounded-full after:opacity-70';
  } else if (isCheck) {
    additionalClass = 'ring-4 ring-red-500 z-10';
  }

  return (
    <div
      className={`relative w-full h-0 pb-[100%] ${baseClass} ${additionalClass} transition-colors duration-200 cursor-pointer`}
      onClick={onClick}
      data-position={`${position.x},${position.y}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default BoardSquare;
