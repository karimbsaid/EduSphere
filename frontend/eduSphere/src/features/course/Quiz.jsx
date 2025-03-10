import Card from "../../ui/Card";

/* eslint-disable react/prop-types */
const QuizQuestion = ({
  Question,
  setUserAnswer,
  userAnswer,
  answered,
  setAnswered,
  questionIndex,
}) => {
  const isMultipleChoice =
    Question.options.filter((opt) => opt.isCorrect).length > 1;

  const toggleOption = (id) => {
    setAnswered(false);

    setUserAnswer(Question._id, id);
  };

  return (
    <Card className="m-12">
      <div className="flex items-center mb-4">
        <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full mr-2">
          {questionIndex}
        </span>
        <h2 className="text-lg font-semibold">{Question.questionText}</h2>
      </div>
      {isMultipleChoice && (
        <p className="text-orange-600 text-sm mb-4">
          Plusieurs réponses possibles
        </p>
      )}
      <div className="space-y-2">
        {Question.options.map((option) => {
          const isSelected =
            userAnswer[Question._id]?.includes(option._id) || false;
          const isCorrect = option.isCorrect;
          const isIncorrect = isSelected && !isCorrect;
          const isOptionCorrect = isSelected && isCorrect;

          return (
            <label
              key={option._id}
              className={`flex items-center space-x-2 cursor-pointer ${
                answered
                  ? isOptionCorrect || isCorrect
                    ? "text-green-500"
                    : isIncorrect
                    ? "text-red-500"
                    : "text-gray-800"
                  : "text-gray-800"
              }`}
            >
              <input
                type={isMultipleChoice ? "checkbox" : "radio"}
                name={`quiz-${Question._id}`}
                checked={isSelected}
                onChange={() => toggleOption(option._id)}
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-0"
              />
              <span>{option.text}</span>
            </label>
          );
        })}
      </div>
    </Card>
  );
};
export default QuizQuestion;
