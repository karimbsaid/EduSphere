import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AppLayout from "./components/AppLayout";
import CourseCreation from "./pages/CourseCreation";
import QuizQuestion from "./features/course/Quiz";
import QuizLecture from "./pages/QuizLecture";
import CourseLecture from "./pages/CourseLecture";
import Login from "./pages/Login";
import { AuthProvider } from "./context/authContext";
import Signup from "./pages/SignUp";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<CourseCreation />} />
            <Route path="/my-courses/:courseId" element={<CourseCreation />} />
            <Route
              path="/course/:courseId/chapter/:sectionId/lecture/:lectureId"
              element={<CourseLecture />}
            />

            {/* <Route path="/my-courses/quiz" element={<QuizLecture />} /> */}
          </Route>
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/my-profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
