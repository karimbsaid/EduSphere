/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Question from "./Question";
import NavigationButton from "./NavigationButton";

export default function Quiz({
  question,
  questionIndex,
  totalQuestion,
  handleAnswer,
  userAnswer,
}) {
  const isMultipleChoice =
    question.options.filter((opt) => opt.isCorrect).length > 1;
  const handleOptionChange = (optionId) => {
    handleAnswer(optionId, questionIndex);
  };
  return (
    <div>
      <div className="flex justify-between mb-4">
        <Badge
          text={`question ${questionIndex + 1} sur ${totalQuestion}`}
          style="text-black bg-gray-200"
        />
        <Badge
          text={`${isMultipleChoice ? "choix multiple" : "choix unique"}`}
          style="bg-black text-white"
        />
      </div>
      <Question
        question={question}
        isMultipleChoice={isMultipleChoice}
        handleAnswer={handleOptionChange}
        userAnswer={userAnswer}
      />
    </div>
  );
}
