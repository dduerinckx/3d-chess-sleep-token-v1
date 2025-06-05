import React, { useState } from 'react';
import ChessBoard from './ChessBoard';
import GameInfo from './GameInfo';
import { initialBoardState } from '../models/initialState';
import { ChessPiece, Position, Move, GameState, PieceColor } from '../models/types';
import { isValidMove, makeMove, isCheck, isCheckmate, isStalemate } from '../utils/gameLogic';

const ChessGame: React.FC = () => {
  const [boardState, setBoardState] = useState<ChessPiece[]>(initialBoardState);
  const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [checkState, setCheckState] = useState({ white: false, black: false });

  const handleSquareClick = (position: Position) => {
    // If the game is over, don't allow any more moves
    if (gameState !== 'playing') return;

    // Find if there's a piece at the clicked position
    const pieceAtPosition = boardState.find(
      (piece) => piece.position.x === position.x && piece.position.y === position.y
    );

    // If a piece is already selected
    if (selectedPiece) {
      // If clicking on the same piece, deselect it
      if (selectedPiece.position.x === position.x && selectedPiece.position.y === position.y) {
        setSelectedPiece(null);
        setValidMoves([]);
        return;
      }

      // If clicking on another piece of the same color, select that piece instead
      if (pieceAtPosition && pieceAtPosition.color === currentPlayer) {
        setSelectedPiece(pieceAtPosition);
        const possibleMoves = boardState
          .filter((piece) => piece.id === pieceAtPosition.id)
          .flatMap((piece) =>
            isValidMove(piece, position, boardState, moveHistory)
              ? [position]
              : []
          );
        setValidMoves(possibleMoves);
        return;
      }

      // Check if the move is valid
      const isValid = validMoves.some(
        (move) => move.x === position.x && move.y === position.y
      );

      if (isValid) {
        // Make the move
        const newBoardState = makeMove(selectedPiece, position, boardState);
        setBoardState(newBoardState);

        // Record the move
        const newMove: Move = {
          piece: selectedPiece,
          from: { ...selectedPiece.position },
          to: { ...position },
          timestamp: new Date(),
        };
        setMoveHistory([...moveHistory, newMove]);

        // Switch player
        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
        setCurrentPlayer(nextPlayer);

        // Check for check, checkmate, or stalemate
        const whiteInCheck = isCheck(newBoardState, 'white');
        const blackInCheck = isCheck(newBoardState, 'black');
        setCheckState({ white: whiteInCheck, black: blackInCheck });

        if (isCheckmate(newBoardState, nextPlayer, [...moveHistory, newMove])) {
          setGameState('checkmate');
        } else if (isStalemate(newBoardState, nextPlayer, [...moveHistory, newMove])) {
          setGameState('stalemate');
        }

        // Reset selection
        setSelectedPiece(null);
        setValidMoves([]);
      }
    } else {
      // If no piece is selected and clicked on a piece of the current player's color
      if (pieceAtPosition && pieceAtPosition.color === currentPlayer) {
        setSelectedPiece(pieceAtPosition);
        
        // Calculate valid moves for the selected piece
        const possibleMoves: Position[] = [];
        for (let x = 0; x < 8; x++) {
          for (let y = 0; y < 8; y++) {
            const targetPosition = { x, y };
            if (isValidMove(pieceAtPosition, targetPosition, boardState, moveHistory)) {
              possibleMoves.push(targetPosition);
            }
          }
        }
        
        setValidMoves(possibleMoves);
      }
    }
  };

  const resetGame = () => {
    setBoardState(initialBoardState);
    setSelectedPiece(null);
    setValidMoves([]);
    setCurrentPlayer('white');
    setGameState('playing');
    setMoveHistory([]);
    setCheckState({ white: false, black: false });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center max-w-6xl mx-auto">
      <div className="w-full md:w-auto">
        <ChessBoard 
          boardState={boardState} 
          selectedPiece={selectedPiece} 
          validMoves={validMoves}
          onSquareClick={handleSquareClick}
          checkState={checkState}
        />
      </div>
      <div className="w-full md:w-80">
        <GameInfo 
          currentPlayer={currentPlayer} 
          gameState={gameState} 
          moveHistory={moveHistory}
          onResetGame={resetGame}
          checkState={checkState}
        />
      </div>
    </div>
  );
};

export default ChessGame;