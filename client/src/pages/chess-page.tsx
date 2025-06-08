import React from "react";
import ChessGame from "@/chess/components/ChessGame";

export default function ChessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center p-4">
      <ChessGame />
    </div>
  );
}
