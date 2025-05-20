import React, { createContext, useReducer } from "react";

// Initial state
const initialState = {
  title: "",
  description: "",
  category: "",
  level: "",
  tags: [],
  coverImage: null,
  sections: [],
  price: 0,
  faq: [], // <-- Add this

  resources: [],
  isEdit: false,
};

// Reducer function
const courseReducer = (state, action) => {
  switch (action.type) {
    case "SET_ALL_FIELDS":
      return {
        ...state,
        ...action.payload,
      };

    case "SET_FIELD": {
      const { field, value, courseId } = action;
      const updatedState = {
        ...state,
        [field]: value,
      };
      if (courseId) {
        updatedState.updated = true;
      }
      return updatedState;
    }
    case "ADD_SECTION": {
      const newSection = {
        title: "",
        lectures: [],
        ...(state.isEdit && { isNew: true }),
      };
      return {
        ...state,
        sections: [...state.sections, newSection],
      };
    }
    case "UPDATE_SECTION_FIELD": {
      //handleSectionChange
      const { sectionIndex, field, value } = action;

      const updatedSections = state.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              [field]: value,
              ...(state.isEdit && !section.isNew && { updated: true }),
            }
          : section
      );

      return {
        ...state,
        sections: updatedSections,
      };
    }

    case "DELETE_SECTION": {
      //handleDeleteSection
      const { sectionIndex } = action;

      const updatedSections = state.sections
        .map((section, i) => {
          if (i === sectionIndex) {
            if (state.isEdit && !section.isNew) {
              return { ...section, deleted: true };
            }
            return null; // remove new section
          }
          return section;
        })
        .filter(Boolean); // remove nulls

      return {
        ...state,
        sections: updatedSections,
      };
    }

    case "ADD_LECTURE": {
      //handleAddContent
      const { sectionIndex, contentType } = action;

      const newLecture = {
        type: contentType,
        title: "",
        ...(contentType === "video" && { file: null, duration: "" }),
        ...(contentType === "quiz" && { questions: [] }),
        ...(contentType === "text" && { content: "" }),
        ...(state.isEdit && { isNew: true }),
      };

      const updatedSections = state.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              lectures: [...section.lectures, newLecture],
            }
          : section
      );

      return {
        ...state,
        sections: updatedSections,
      };
    }
    case "UPDATE_LECTURE_FIELD": {
      //handleContentChange
      const { sectionIndex, lectureIndex, field, value } = action;

      const updatedSections = state.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              lectures: section.lectures.map((lecture, j) =>
                j === lectureIndex
                  ? {
                      ...lecture,
                      [field]: value,
                      ...(state.isEdit && !lecture.isNew && { updated: true }),
                    }
                  : lecture
              ),
            }
          : section
      );

      return {
        ...state,
        sections: updatedSections,
      };
    }
    case "DELETE_LECTURE": {
      //handleDeleteContent
      const { sectionIndex, lectureIndex } = action;

      const updatedSections = state.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              lectures: section.lectures
                .map((lecture, j) =>
                  j === lectureIndex
                    ? state.isEdit && !lecture.isNew
                      ? { ...lecture, deleted: true }
                      : null
                    : lecture
                )
                .filter(Boolean),
            }
          : section
      );

      return {
        ...state,
        sections: updatedSections,
      };
    }

    case "ADD_QUIZ_QUESTION": {
      //handleAddQuizQuestion
      const { sectionIndex, lectureIndex } = action;

      const newQuestion = {
        questionText: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      };

      const updatedSections = state.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              lectures: section.lectures.map((lecture, j) =>
                j === lectureIndex
                  ? {
                      ...lecture,
                      questions: [...(lecture.questions || []), newQuestion],
                    }
                  : lecture
              ),
            }
          : section
      );

      return {
        ...state,
        sections: updatedSections,
      };
    }

    case "UPDATE_QUIZ_QUESTION_FIELD": {
      //handleQuestionChange
      const { sectionIndex, lectureIndex, questionIndex, field, value } =
        action;

      const updatedSections = state.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              lectures: section.lectures.map((lecture, lIdx) =>
                lIdx === lectureIndex
                  ? {
                      ...lecture,
                      questions: lecture.questions.map((question, qIdx) =>
                        qIdx === questionIndex
                          ? { ...question, [field]: value }
                          : question
                      ),
                      ...(state.isEdit && { updated: true }),
                    }
                  : lecture
              ),
            }
          : section
      );

      return {
        ...state,
        sections: updatedSections,
      };
    }

    case "UPDATE_QUIZ_OPTION_FIELD": {
      //handleOptionChange
      const {
        sectionIndex,
        lectureIndex,
        questionIndex,
        optionIndex,
        field,
        value,
      } = action;

      const updatedSections = state.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              lectures: section.lectures.map((lecture, lIdx) =>
                lIdx === lectureIndex
                  ? {
                      ...lecture,
                      questions: lecture.questions.map((question, qIdx) =>
                        qIdx === questionIndex
                          ? {
                              ...question,
                              options: question.options.map((opt, oIdx) =>
                                oIdx === optionIndex
                                  ? { ...opt, [field]: value }
                                  : opt
                              ),
                            }
                          : question
                      ),
                      ...(state.isEdit && { updated: true }),
                    }
                  : lecture
              ),
            }
          : section
      );

      return {
        ...state,
        sections: updatedSections,
      };
    }

    case "ADD_RESOURCE": {
      //handleAddResource
      const newResource = {
        title: "",
        file: null,
        ...(state.isEdit && { isNew: true }),
      };

      return {
        ...state,
        resources: [...state.resources, newResource],
      };
    }

    case "UPDATE_RESOURCE_FIELD": {
      const { resourceIndex, field, value } = action;

      const updatedResources = state.resources.map((res, i) =>
        i === resourceIndex
          ? {
              ...res,
              [field]: value,
              ...(state.isEdit ? { updated: true } : {}),
            }
          : res
      );

      return {
        ...state,
        resources: updatedResources,
      };
    }

    case "DELETE_RESOURCE": {
      const { resourceIndex } = action;

      const updatedResources = state.resources
        .map((res, i) => {
          if (i !== resourceIndex) return res;

          if (state.isEdit && !res.isNew) {
            return { ...res, deleted: true }; // Soft delete
          }

          return null; // Hard delete for new or non-edit mode
        })
        .filter(Boolean);

      return {
        ...state,
        resources: updatedResources,
      };
    }
    case "UPDATE_FAQ_FIELD": {
      const { index, field, value } = action;
      const updatedFaq = state.faq.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      );
      return { ...state, faq: updatedFaq };
    }

    case "ADD_FAQ": {
      return { ...state, faq: [...state.faq, { title: "", content: "" }] };
    }

    case "DELETE_FAQ": {
      const { index } = action;
      const updatedFaq = state.faq.filter((_, i) => i !== index);
      return { ...state, faq: updatedFaq };
    }

    case "SET_FAQ": {
      return { ...state, faq: action.payload };
    }

    case "RESET":
      return initialState;
    default:
      return state;
  }
};

// Create context
export const CourseContext = createContext();

// Provider component
export const CourseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  return (
    <CourseContext.Provider value={{ state, dispatch }}>
      {children}
    </CourseContext.Provider>
  );
};
