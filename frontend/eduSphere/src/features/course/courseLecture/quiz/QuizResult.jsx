/* eslint-disable react/prop-types */
import React from "react";
import {
  FaAward,
  FaCheckCircle,
  FaTimesCircle,
  FaTrophy,
} from "react-icons/fa";
import Badge from "../../../../ui/Badge";
import Button from "../../../../ui/Button";

export default function QuizResult({
  score,
  totalQuestions,
  minScore = 70,
  answers,
  onTry,
}) {
  const passed = (score / totalQuestions) * 100 >= minScore;
  const percentage = ((score / totalQuestions) * 100).toFixed(0);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100">
      <div
        className={`relative p-6 rounded-xl mb-8 ${
          passed
            ? "bg-gradient-to-r from-green-500 to-emerald-600"
            : "bg-gradient-to-r from-red-500 to-rose-600"
        } text-white overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {passed ? (
                <FaTrophy className="text-yellow-300" size={32} />
              ) : (
                <FaAward className="text-white opacity-80" size={32} />
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {passed ? "🎉 Félicitations !" : "💪 Dommage !"}
                </h2>
                <p className="text-white text-opacity-90">
                  {passed
                    ? "Vous avez brillamment réussi le quiz !"
                    : "N'abandonnez pas, vous pouvez faire mieux !"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{percentage}%</div>
              <div className="text-sm opacity-90">Score final</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
          <div className="text-3xl font-bold text-blue-600">{score}</div>
          <div className="text-gray-500 mt-1">Questions correctes</div>
          <div className="text-sm text-gray-400">sur {totalQuestions}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {percentage}%
          </div>
          <div className="text-gray-500 mt-1">Score obtenu</div>
          <div
            className={`text-sm mt-1 ${
              passed ? "text-green-600" : "text-red-600"
            }`}
          >
            {passed ? "✓ Réussi" : "✗ Échoué"}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
          <div className="text-3xl font-bold text-orange-600">{minScore}%</div>
          <div className="text-gray-500 mt-1">Score requis</div>
          <div className="text-sm text-gray-400">minimum</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
          Récapitulatif détaillé
        </h3>

        <div className="grid gap-4">
          {answers.map((answer, index) => (
            <div
              key={index}
              className={`p-5 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
                answer.isCorrect
                  ? "bg-green-50 border-l-green-500 hover:bg-green-100"
                  : "bg-red-50 border-l-red-500 hover:bg-red-100"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {answer.isCorrect ? (
                    <FaCheckCircle
                      className="text-green-600 flex-shrink-0"
                      size={20}
                    />
                  ) : (
                    <FaTimesCircle
                      className="text-red-600 flex-shrink-0"
                      size={20}
                    />
                  )}
                  <span className="font-semibold text-gray-700">
                    Question {index + 1}
                  </span>
                </div>
                <Badge
                  text={answer.isCorrect ? "Correcte" : "Incorrect"}
                  style={
                    answer.isCorrect
                      ? "bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full text-xs"
                      : "bg-red-100 text-red-700 font-medium px-3 py-1 rounded-full text-xs"
                  }
                />
              </div>

              <p className="text-gray-800 font-medium mb-3 text-sm leading-relaxed">
                {answer.questionText}
              </p>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center">
                  <span className="font-semibold text-gray-600 text-sm mr-2">
                    Votre réponse :
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {answer.selectedOptions.map((opt, optIndex) => (
                      <span
                        key={optIndex}
                        className={`px-2 py-1 rounded text-xs ${
                          answer.isCorrect
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>

                {!answer.isCorrect && (
                  <div className="flex flex-wrap items-center">
                    <span className="font-semibold text-gray-600 text-sm mr-2">
                      Réponse correcte :
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {answer.correctOptions.map((opt, optIndex) => (
                        <span
                          key={optIndex}
                          className="px-2 py-1 rounded text-xs bg-green-200 text-green-800"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button
          onClick={onTry}
          label="🔄 Ressayer le quiz"
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        />
        <Button
          label="✅ Terminer le quiz"
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        />
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          {passed
            ? "🌟 Excellent travail ! Continuez sur cette lancée !"
            : "💪 L'échec est le fondement du succès. Réessayez !"}
        </p>
      </div>
    </div>
  );
}
