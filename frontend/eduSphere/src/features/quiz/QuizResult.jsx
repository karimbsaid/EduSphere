/* eslint-disable react/prop-types */
import React from "react";
import { FaAward } from "react-icons/fa";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

export default function QuizResult({
  score,
  totalQuestions,
  minScore = 70,
  answers,
  onTry,
}) {
  const passed = (score / totalQuestions) * 100 >= minScore;

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* En-tête */}
      <div
        className={`p-4 rounded-lg ${passed ? "bg-green-100" : "bg-red-100"}`}
      >
        <div className="flex items-center space-x-3">
          <FaAward className="text-green-600" size={24} />
          <h2 className="text-xl font-semibold">
            {passed ? "Félicitations !" : "Dommage !"}
          </h2>
        </div>
        <p className="text-gray-600">
          {passed
            ? "Vous avez réussi le quiz avec succès !"
            : "Vous n'avez pas atteint le score requis."}
        </p>
      </div>

      {/* Résumé des scores */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">
            {((score / totalQuestions) * 100).toFixed(0)}%
          </p>
          <p className="text-gray-500">Votre score</p>
        </div>
        <div>
          <p className="text-xl font-semibold">{minScore}%</p>
          <p className="text-gray-500">Score minimum requis</p>
        </div>
      </div>

      {/* Récapitulatif des questions */}
      <h3 className="mt-6 text-lg font-semibold">
        Récapitulatif des questions
      </h3>
      <div className="space-y-4 mt-3">
        {answers.map((answer, index) => (
          <div
            key={index}
            className={`p-4  rounded-lg ${
              answer.isCorrect
                ? "bg-green-50 border-green-700"
                : "bg-red-50 border-red-50"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-green-700 font-semibold">
                Question {index + 1} :
              </span>
              <Badge
                text={answer.isCorrect ? "Correcte" : "Incorrect"}
                style={
                  answer.isCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              />
            </div>
            <p className="text-gray-800 font-medium">{answer.questionText}</p>
            <p className="text-gray-600">
              <span className="font-semibold">Votre réponse : </span>
              {answer.selectedOptions.map((opt, index) => (
                <span key={index}>{opt}</span>
              ))}
            </p>
            <p className="text-gray-600">
              {!answer.isCorrect && (
                <>
                  <span className="font-semibold">Réponse correcte : </span>
                  {answer.correctOptions.map((opt, index) => (
                    <span key={index}>{opt}</span>
                  ))}
                </>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Bouton pour terminer */}
      <div className="flex space-x-1">
        <Button
          onClick={onTry}
          label="Ressayer le quiz"
          className="mt-6  bg-black text-white py-2 rounded-lg hover:bg-green-700"
        />
        <Button
          label="Terminer le quiz"
          className="mt-6  bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        />
      </div>
    </div>
  );
}
