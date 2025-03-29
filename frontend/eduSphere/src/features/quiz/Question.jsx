/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Option from "./Option";
export default function Question({
  question,
  isMultipleChoice,
  handleAnswer,
  userAnswer,
}) {
  console.log("userAnswer", userAnswer);
  return (
    <div className="container flex-col gap-1">
      <h1 className="text-lg font-semibold mb-4">{question.questionText}</h1>
      {question.options.map((op, index) => (
        <Option
          key={index}
          option={op}
          optionIndex={index}
          isMultipleChoice={isMultipleChoice}
          toggleOption={handleAnswer}
          isSelected={userAnswer.includes(index)}
        />
      ))}
    </div>
  );
}
