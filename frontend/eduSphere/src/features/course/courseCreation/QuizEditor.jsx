/* eslint-disable react/prop-types */
import { HiPlus } from "react-icons/hi2";
import QuestionEditor from "./QuestionEditor";
import { useContext } from "react";
import { CourseContext } from "../../../context/courseContext";
import Button from "../../../ui/Button";

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
    <div className="space-y-4">
      {questions.map((question, questionIndex) => (
        <QuestionEditor
          key={questionIndex}
          question={question}
          questionIndex={questionIndex}
          sectionIndex={sectionIndex}
          contentIndex={contentIndex}
        />
      ))}
      <div className="pt-2">
        <Button
          size="sm"
          variant="simple"
          outline
          onClick={handleAddQuizQuestion}
        >
          <HiPlus className="w-4 h-4" />
          <span>Question</span>
        </Button>
      </div>
    </div>
  );
}
