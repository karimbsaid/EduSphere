import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GuestPage from "./pages/guestHomePage";
import AppLayout from "./components/AppLayout";
import CourseCreation from "./pages/CourseCreation";
import CourseLecture from "./pages/CourseLecture";
import Login from "./pages/Login";
import { AuthProvider } from "./context/authContext";
import Signup from "./pages/SignUp";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import AddReview from "./pages/CourseReview";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import EnrolledCourse from "./pages/EnrolledCourse";
import CoursesPage from "./pages/Courses";
import Users from "./pages/Users";
import Statistique from "./pages/Statistique";
import CoursesDashboard from "./pages/CoursesDashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import RapportAndAnalyse from "./pages/RapportAndAnalyse";
import TestModalPage from "./pages/test";
import Test from "./pages/test";
import PaymentsDashboard from "./pages/PaymentsDashboard";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<GuestPage />} />
          <Route element={<ProtectedRoute group={["admin", "instructor"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/test" element={<Test />} />
              <Route path="/accueil" element={<HomePage />} />
              <Route path="/my-courses/add" element={<CourseCreation />} />
              <Route
                path="/my-courses/:courseId"
                element={<CourseCreation />}
              />
              <Route path="/my-enrolled-courses" element={<EnrolledCourse />} />
              <Route path="/dashboard/users" element={<Users />} />
              <Route path="/dashboard/courses" element={<CoursesDashboard />} />
              <Route
                path="/dashboard/payments"
                element={<PaymentsDashboard />}
              />
              <Route path="/dashboard/stats" element={<Statistique />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/rapport" element={<RapportAndAnalyse />} />

              <Route
                path="/course/:courseId/add-review"
                element={<AddReview />}
              />
              <Route
                path="/course/:courseId/chapter/:sectionId/lecture/:lectureId"
                element={<CourseLecture />}
              />
              <Route path="/teacher/dashboard" element={<Dashboard />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/my-profile" element={<Profile />} />

              {/* <Route path="/my-courses/quiz" element={<QuizLecture />} /> */}
            </Route>
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/test" element={<TestModalPage />} />
          <Route path="/register" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
