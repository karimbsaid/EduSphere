/* eslint-disable react/prop-types */
import { HiPlus } from "react-icons/hi2";
import QuestionEditor from "./QuestionEditor";

export default function QuizEditor({
  questions,
  sectionIndex,
  contentIndex,
  setCourseData,
}) {
  const handleAddQuizQuestion = () => {
    setCourseData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              lectures: section.lectures.map((content, j) =>
                j === contentIndex
                  ? {
                      ...content,
                      questions: [
                        ...content.questions,
                        {
                          questionText: "",
                          options: [
                            { text: "", isCorrect: false },
                            { text: "", isCorrect: false },
                            { text: "", isCorrect: false },
                            { text: "", isCorrect: false },
                          ],
                        },
                      ],
                    }
                  : content
              ),
            }
          : section
      ),
    }));
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
          setCourseData={setCourseData}
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
