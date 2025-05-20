/* eslint-disable react/prop-types */
import { HiPlus } from "react-icons/hi2";
import QuestionEditor from "./QuestionEditor";
import { useContext } from "react";
import { CourseContext } from "../../../context/courseContext";

export default function QuizEditor({ questions, sectionIndex, contentIndex }) {
  const { dispatch } = useContext(CourseContext);
  const handleAddQuizQuestion = () => {
    dispatch({
      type: "ADD_QUIZ_QUESTION",
      sectionIndex,
      lectureIndex: contentIndex,
    });
  };

  return (
    <div>
      {questions.map((question, questionIndex) => (
        <QuestionEditor
          key={questionIndex}
          question={question}
          questionIndex={questionIndex}
          sectionIndex={sectionIndex}
          contentIndex={contentIndex}
        />
      ))}
      <button
        className="flex flex-row items-center bg-blue-200 p-2 border-black-200"
        size="sm"
        onClick={handleAddQuizQuestion}
      >
        <HiPlus className="mr-2 h-4 w-4" />
        Add Question
      </button>
    </div>
  );
}
