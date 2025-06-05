import React from 'react';
import ChessGame from './components/ChessGame';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col items-center justify-center p-4">
      <ChessGame />
    </div>
  );
}

export default App;