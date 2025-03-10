/* eslint-disable react/prop-types */
export default function QuestionEditor({
  question,
  questionIndex,
  sectionIndex,
  contentIndex,
  setCourseData,
}) {
  // Dans votre composant parent (ex: CourseForm.jsx)
  const handleQuestionChange = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;

        return {
          ...section,
          lectures: section.lectures.map((content, cIdx) => {
            if (cIdx !== contentIndex) return content;

            return {
              ...content,
              questions: content.questions.map((q, qIdx) => {
                if (qIdx !== questionIndex) return q;

                return {
                  ...q,
                  [field]: value,
                };
              }),
              ...(prev.isEdit && { updated: true }), // Ajout de updated: true au niveau de lecture
            };
          }),
        };
      }),
    }));
  };

  const handleOptionChange = (optionIndex, field, value) => {
    setCourseData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;

        return {
          ...section,
          lectures: section.lectures.map((content, cIdx) => {
            if (cIdx !== contentIndex) return content;

            return {
              ...content,
              questions: content.questions.map((q, qIdx) => {
                if (qIdx !== questionIndex) return q;

                const newOptions = q.options.map((opt, oIdx) =>
                  oIdx === optionIndex ? { ...opt, [field]: value } : opt
                );

                return {
                  ...q,
                  options: newOptions,
                };
              }),
              ...(prev.isEdit && { updated: true }), // Ajout de updated: true au niveau de lecture
            };
          }),
        };
      }),
    }));
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
