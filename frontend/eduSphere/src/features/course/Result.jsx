/* eslint-disable react/prop-types */
import { useState } from "react";

function ResultContent({ score, handleReset }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">Résultat</h2>
      <div className="flex items-center justify-center gap-2 text-xl">
        <span>Votre score:</span>
        <span className="font-bold text-2xl">{score}</span>
      </div>
      {score >= 70 ? (
        <p className="text-green-500 mt-2 font-medium">
          Parfait! Félicitations!
        </p>
      ) : (
        <p className="text-red-500 mt-2 font-medium">
          Vous pouvez vous améliorer. réessayez.
        </p>
      )}
      <button
        onClick={handleReset}
        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-2 rounded-lg"
      >
        Recommencer le quiz
      </button>
    </div>
  );
}
export default ResultContent;
