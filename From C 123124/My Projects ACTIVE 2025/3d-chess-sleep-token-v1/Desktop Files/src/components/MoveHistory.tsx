import React from 'react';
import { PieceColor } from '../models/types';

interface FormattedMove {
  number: number;
  color: PieceColor;
  notation: string;
}

interface MoveHistoryProps {
  moves: FormattedMove[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  // Pair up the moves (white and black)
  const pairedMoves = [];
  for (let i = 0; i < moves.length; i += 2) {
    const whiteMove = moves[i];
    const blackMove = i + 1 < moves.length ? moves[i + 1] : null;
    
    pairedMoves.push({ whiteMove, blackMove });
  }

  return (
    <div className="w-full">
      <h3 className="text-2xl font-semibold text-amber-900 mb-4">Move History</h3>
      
      {moves.length === 0 ? (
        <p className="text-lg text-amber-700 italic">No moves yet</p>
      ) : (
        <div className="max-h-80 overflow-y-auto pr-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-amber-100 text-amber-900">
                <th className="py-2 px-3 text-left w-1/5 text-lg">#</th>
                <th className="py-2 px-3 text-left w-2/5 text-lg">White</th>
                <th className="py-2 px-3 text-left w-2/5 text-lg">Black</th>
              </tr>
            </thead>
            <tbody>
              {pairedMoves.map(({ whiteMove, blackMove }, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
                  <td className="py-2 px-3 text-amber-900 text-lg">{whiteMove.number}</td>
                  <td className="py-2 px-3 font-medium text-lg">{whiteMove.notation}</td>
                  <td className="py-2 px-3 font-medium text-lg">{blackMove ? blackMove.notation : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MoveHistory;