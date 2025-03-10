/* eslint-disable react/prop-types */
import { useState } from "react";
import QuizQuestion from "../features/course/Quiz";
import Modal from "../components/Modal";
import ResultContent from "../features/course/Result";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function QuizLecture({ Questions, onCompleted }) {
  const [userAnswer, setUserAnswer] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnswer = (questionId, optionId) => {
    setUserAnswer((prev) => {
      const currentAnswers = prev[questionId] || [];
      const isMultipleChoice =
        Questions.find((q) => q._id === questionId).options.filter(
          (opt) => opt.isCorrect
        ).length > 1;

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

  const handleSubmit = () => {
    setAnswered(true); // Marquer que le quiz a été soumis
    let score = 0;
    let totalOptCorrect = 0;
    Questions.forEach((question) => {
      question.options.forEach((opt) => {
        const isSelected = userAnswer[question._id]?.includes(opt._id) || false;
        const isCorrect = opt.isCorrect;
        if (isCorrect) {
          totalOptCorrect++;
        }
        const isOptionCorrect = isSelected && isCorrect;
        if (isOptionCorrect) {
          score++;
        }
      });
    });
    setIsModalOpen(true);
    setScore((score / totalOptCorrect) * 100);
    onCompleted();
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ResultContent
          score={score}
          handleReset={() => setIsModalOpen(false)}
        />
      </Modal>
      {Questions.map((ques, index) => (
        <Card key={ques._id}>
          <QuizQuestion
            setAnswered={setAnswered}
            questionIndex={index}
            Question={ques}
            setUserAnswer={handleAnswer}
            userAnswer={userAnswer}
            answered={answered} // Passer si la soumission a eu lieu
          />
          <Button
            className="bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
            onClick={handleSubmit}
          >
            Envoyer
          </Button>
        </Card>
      ))}
    </>
  );
}
