import { useContext } from "react";
import { CourseContext } from "../../../context/courseContext";

/* eslint-disable react/prop-types */
export default function QuestionEditor({
  question,
  questionIndex,
  sectionIndex,
  contentIndex,
}) {
  const { dispatch } = useContext(CourseContext);
  const handleQuestionChange = (field, value) => {
    dispatch({
      type: "UPDATE_QUIZ_QUESTION_FIELD",
      sectionIndex,
      lectureIndex: contentIndex,
      questionIndex,
      field,
      value,
    });
  };

  const handleOptionChange = (optionIndex, field, value) => {
    dispatch({
      type: "UPDATE_QUIZ_OPTION_FIELD",
      sectionIndex,
      lectureIndex: contentIndex,
      questionIndex,
      optionIndex,
      field,
      value,
    });
  };

  return (
    <div className="rounded border p-2">
      <input
        type="text"
        value={question.questionText}
        onChange={(e) => handleQuestionChange("questionText", e.target.value)}
        placeholder="Question"
        className="mb-2 w-full p-2 border rounded"
      />
      {question.options.map((option, optionIndex) => (
        <div key={optionIndex} className="flex items-center space-x-2 w-full">
          <input
            type="text"
            value={option.text}
            onChange={(e) =>
              handleOptionChange(optionIndex, "text", e.target.value)
            }
            placeholder={`Option ${optionIndex + 1}`}
            className="mb-2 p-1 border rounded"
          />
          <input
            type="checkbox"
            checked={option.isCorrect}
            onChange={(e) =>
              handleOptionChange(optionIndex, "isCorrect", e.target.checked)
            }
          />
        </div>
      ))}
    </div>
  );
}
