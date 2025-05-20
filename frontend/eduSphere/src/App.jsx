import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GuestPage from "./pages/guestHomePage";
import AppLayout from "./components/AppLayout";
import CourseCreation from "./pages/CourseCreation";
import CourseLecture from "./pages/CourseLecture";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/authContext";
import Signup from "./pages/SignUp";
import Profile from "./pages/Profile";
import AddReview from "./pages/CourseReview";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import EnrolledCourse from "./pages/EnrolledCourse";
import CoursesPage from "./pages/CoursesPage";
import Users from "./pages/UsersPage";
import CoursesDashboard from "./pages/CoursesDashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import PaymentsDashboard from "./pages/PaymentsDashboard";
import PublicLayout from "./components/PublicLayout";
import { Toaster } from "react-hot-toast";
import Spinner from "./ui/Spinner";
import EnrolledStudentPage from "./pages/EnrolledStudentPage";
import CoursePreviewPage from "./pages/CoursePreviewPage";
import CourseDetailPage from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import EnrolledStudentRoute from "./pages/EnrolledStudentRoute";
import { CourseProvider } from "./context/courseContext";

function App() {
  const LayoutSelector = ({ children }) => {
    const { user } = useAuth();
    // console.log(user);
    return user ? (
      <AppLayout>{children}</AppLayout>
    ) : (
      <PublicLayout>{children}</PublicLayout>
    );
  };
  const HomeRoute = () => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <Spinner size="lg" />
          <div className="ml-4 text-lg">Chargement...</div>
        </div>
      );
    }

    return user ? <HomePage /> : <GuestPage />;
  };
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<LayoutSelector />}>
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course/:courseId" element={<CourseDetailPage />} />
            <Route path="/" element={<HomeRoute />} />
          </Route>
          <Route element={<AppLayout />}>
            <Route path="/my-enrolled-courses" element={<EnrolledCourse />} />
            <Route
              path="/course/:courseId/chapter/:sectionId/lecture/:lectureId"
              element={<CourseLecture />}
            />
            <Route
              path="/course/:courseId/add-review"
              element={<AddReview />}
            />
            <Route element={<ProtectedRoute group={["Admin", "Instructor"]} />}>
              <Route
                path="/my-courses/add"
                element={
                  <CourseProvider>
                    <CourseCreation />
                  </CourseProvider>
                }
              />
              <Route
                path="/course/:courseId/preview"
                element={<CoursePreviewPage />}
              />

              <Route
                path="/my-courses/my-students"
                element={<EnrolledStudentPage />}
              />
              <Route
                path="/my-courses/:courseId"
                element={
                  <CourseProvider>
                    <CourseCreation />
                  </CourseProvider>
                }
              />
              <Route path="/dashboard/users" element={<Users />} />
              <Route path="/dashboard/courses" element={<CoursesDashboard />} />
              <Route
                path="/dashboard/payments"
                element={<PaymentsDashboard />}
              />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/my-profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "var(--color-grey-0)",
            color: "var(--color-grey-700)",
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
