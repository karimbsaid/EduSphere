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
    <div className="rounded border p-2">
      <div className="flex justify-between items-center mb-2">
        <input
          type="text"
          value={question.questionText}
          onChange={(e) => handleQuestionChange("questionText", e.target.value)}
          placeholder="Question"
          className="mb-2 w-full p-2 border rounded"
        />
        <HiOutlineTrash size={20} onClick={handleDeleteQuestion} />
      </div>
      {question.options.map((option, optionIndex) => (
        <div key={optionIndex} className="flex items-center space-x-2 w-full">
          <Input
            type="text"
            value={option.text}
            onChange={(e) =>
              handleOptionChange(optionIndex, "text", e.target.value)
            }
            placeholder={`Option ${optionIndex + 1}`}
          />
          {/* <input
            type="text"
            value={option.text}
            onChange={(e) =>
              handleOptionChange(optionIndex, "text", e.target.value)
            }
            placeholder={`Option ${optionIndex + 1}`}
            className="mb-2 p-1 border rounded"
          /> */}
          <Input
            type="checkbox"
            checked={option.isCorrect}
            onChange={(e) =>
              handleOptionChange(optionIndex, "isCorrect", e.target.checked)
            }
          />
          {/* <input
            type="checkbox"
            checked={option.isCorrect}
            onChange={(e) =>
              handleOptionChange(optionIndex, "isCorrect", e.target.checked)
            }
          /> */}
          {question.options.length > 1 && (
            <HiXMark onClick={() => handleDeleteOption(optionIndex)} />
          )}
        </div>
      ))}
      {question.options.length < 4 && (
        <Button
          onClick={handleAddOption}
          className="text-sm text-blue-600 hover:underline mt-2"
        >
          <HiPlus />
          <span>Add Option</span>
        </Button>
      )}
    </div>
  );
}
