/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Card from "../../../ui/Card";
import {
  HiMiniChartBar,
  HiOutlineClock,
  HiOutlineQuestionMarkCircle,
  HiOutlineTrophy,
} from "react-icons/hi2";
import ProgressBar from "../../../components/ProgressBar";
import Button from "../../../ui/Button";
import NavigationButton from "../../quiz/NavigationButton";
import Quiz from "../../quiz/Quiz";
import QuizResult from "../../quiz/QuizResult";
export default function QuizLecture({ questions, onComplete, duration }) {
  const [timeLeft, setTimeLeft] = useState(duration || 900);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    setShowResult(true);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const [userAnswer, setUserAnswer] = useState([]);
  const handleTry = () => {
    setUserAnswer([]);
    setScore(0);
    setQuestionStep(0);
    setShowResult(false);
    setTimeLeft(900);
  };
  const handleAnswer = (optionId, questionId) => {
    setUserAnswer((prev) => {
      const currentAnswers = prev[questionId] || [];
      const isMultipleChoice =
        questions[questionId]?.options.filter((opt) => opt.isCorrect).length >
        1;

      if (isMultipleChoice) {
        return {
          ...prev,
          [questionId]: currentAnswers.includes(optionId)
            ? currentAnswers.filter((id) => id !== optionId)
            : [...currentAnswers, optionId],
        };
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const [currentQuestion, setQuestionStep] = useState(0);
  const [isResultVisible, setShowResult] = useState(false);
  const totalQuestion = questions.length;
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const handleNext = () => {
    if (currentQuestion === questions.length - 1) {
      let totalScore = 0;
      const resultsData = [];

      questions.forEach((question, index) => {
        const selectedOptions = userAnswer[index] || [];
        const correctOptions = question.options
          .map((opt, optIndex) => (opt.isCorrect ? optIndex : null))
          .filter((opt) => opt !== null); // Garde seulement les index corrects

        const isCorrect =
          selectedOptions.length === correctOptions.length &&
          selectedOptions.every((opt) => correctOptions.includes(opt));

        if (isCorrect) totalScore++;

        resultsData.push({
          questionText: question.questionText,
          selectedOptions: selectedOptions.map(
            (optIndex) => question.options[optIndex]?.text
          ),
          correctOptions: correctOptions.map(
            (optIndex) => question.options[optIndex]?.text
          ),
          isCorrect,
        });
      });

      setScore(totalScore);
      setResults(resultsData);
      setShowResult(true);
      onComplete();
      return;
    }

    setQuestionStep((prev) => prev + 1);
  };

  return (
    <div>
      <Card className="shadow-lg m-4 space-y-4 flex-col ">
        <h1 className="font-bold text-lg tracking-wide">module 1</h1>
        <div className="flex space-x-4 ">
          <div className="flex space-x-2 items-center">
            <HiOutlineClock />
            <span>Durée : {formatTime(duration)} </span>
          </div>
          <div className="flex space-x-2 items-center">
            <HiOutlineQuestionMarkCircle />
            <span>Questions : 8</span>
          </div>
          <div className="flex space-x-2 items-center">
            <HiOutlineTrophy />
            <span>Score minimum: 70%</span>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-3">
        <Card className="border-2 shadow-lg m-4 space-y-4 ">
          <h1 className="font-bold text-lg tracking-wide">Information</h1>
          <div className="flex justify-between">
            <div className="flex space-x-1 items-center">
              <HiMiniChartBar />
              <h1 className="font-normal">Progression</h1>
            </div>
            <div className="flex  space-x-1 items-center">
              <HiOutlineClock />
              <h1 className="font-normal">{formatTime(timeLeft)} restants</h1>
            </div>
          </div>
          <ProgressBar myAvance={currentQuestion + 1} total={totalQuestion} />
          <div className="flex justify-between">
            <span>
              Question {currentQuestion + 1} / {totalQuestion}
            </span>
          </div>
          <h1 className="font-semibold">Navigation rapide</h1>
          <div className="flex flex-wrap space-x-2">
            {questions.map((ques, index) => (
              <Button
                label={index + 1}
                className={`${
                  currentQuestion === index
                    ? "bg-black text-white"
                    : userAnswer[index]
                    ? "bg-green-200 text-black"
                    : "bg-white text-black"
                }`}
                key={index}
                onClick={() => setQuestionStep(index)}
              />
            ))}
          </div>
          <Button
            onClick={onComplete}
            label="terminer le quiz"
            className="bg-green-500 text-white "
          />
        </Card>

        <Card className="border-2 shadow-lg m-4 col-span-2">
          {isResultVisible ? (
            <QuizResult
              onTry={handleTry}
              score={score}
              totalQuestions={totalQuestion}
              answers={results}
            />
          ) : (
            <>
              <Quiz
                question={questions[currentQuestion]}
                questionIndex={currentQuestion}
                totalQuestion={totalQuestion}
                handleAnswer={handleAnswer}
                userAnswer={userAnswer[currentQuestion] || []}
              />
              <NavigationButton
                onBack={() =>
                  setQuestionStep((prev) => (prev > 0 ? prev - 1 : prev))
                }
                prevDisabled={currentQuestion === 0}
                nextDisabled={!userAnswer[currentQuestion]}
                nextLabel={
                  currentQuestion === totalQuestion - 1 && "terminer le quiz"
                }
                className={
                  currentQuestion === totalQuestion - 1 && "bg-green-500"
                }
                onNext={handleNext}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
