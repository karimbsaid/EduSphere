import { useContext } from "react";
import { CourseContext } from "../../../context/courseContext";
import {
  HiOutlineTrash,
  HiOutlineXCircle,
  HiPlus,
  HiXCircle,
  HiXMark,
} from "react-icons/hi2";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";

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

  const handleDeleteQuestion = () => {
    dispatch({
      type: "DELETE_QUIZ_QUESTION",
      sectionIndex,
      lectureIndex: contentIndex,
      questionIndex,
    });
  };

  const handleAddOption = () => {
    dispatch({
      type: "ADD_QUIZ_OPTION",
      sectionIndex,
      lectureIndex: contentIndex,
      questionIndex,
    });
  };

  const handleDeleteOption = (optionIndex) => {
    dispatch({
      type: "DELETE_QUIZ_OPTION",
      sectionIndex,
      lectureIndex: contentIndex,
      questionIndex,
      optionIndex,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <input
          type="text"
          value={question.questionText}
          onChange={(e) => handleQuestionChange("questionText", e.target.value)}
          placeholder="Question"
          className="flex-1 px-3 py-2 text-sm font-medium bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          onClick={handleDeleteQuestion}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
        >
          <HiOutlineTrash size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {question.options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center gap-3">
            <Input
              type="text"
              value={option.text}
              onChange={(e) =>
                handleOptionChange(optionIndex, "text", e.target.value)
              }
              placeholder={`Option ${optionIndex + 1}`}
              className="flex-1 text-sm"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={option.isCorrect}
                onChange={(e) =>
                  handleOptionChange(optionIndex, "isCorrect", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Correct</span>
            </label>
            {question.options.length > 1 && (
              <button
                onClick={() => handleDeleteOption(optionIndex)}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <HiXMark size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {question.options.length < 4 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Button onClick={handleAddOption} variant="simple" outline size="sm">
            <HiPlus className="w-4 h-4" />
            <span>Option</span>
          </Button>
        </div>
      )}
    </div>
  );
}
