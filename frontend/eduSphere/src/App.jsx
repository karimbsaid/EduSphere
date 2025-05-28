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
import EnrolledStudentPage from "./pages/EnrolledStudentPage";
import CoursePreviewPage from "./pages/CoursePreviewPage";
import CourseDetailPage from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import { CourseProvider } from "./context/courseContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import Loading from "./components/Loading";
import Role from "./pages/Role";
import FeatureManagment from "./pages/FeatureManagment";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
      },
    },
  });

  const LayoutSelector = ({ children }) => {
    const { user, isLoading } = useAuth();
    // console.log(user);
    if (isLoading) {
      return <isLoading />;
    }
    return user ? (
      <AppLayout>{children}</AppLayout>
    ) : (
      <PublicLayout>{children}</PublicLayout>
    );
  };
  const HomeRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return <Loading />;
    }

    if (user?.role?.name === "Admin" || user?.role?.name === "Instructor") {
      return <Navigate to="/dashboard" replace />;
    }

    return user ? <HomePage /> : <GuestPage />;
  };
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route element={<LayoutSelector />}>
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/course/:courseId" element={<CourseDetailPage />} />
              <Route path="/" element={<HomeRoute />} />
            </Route>
            <Route element={<AppLayout />}>
              <Route element={<ProtectedRoute group={["Student"]} />}>
                <Route
                  path="/my-enrolled-courses"
                  element={<EnrolledCourse />}
                />
                <Route
                  path="/course/:courseId/chapter/:sectionId/lecture/:lectureId"
                  element={<CourseLecture />}
                />
                <Route
                  path="/course/:courseId/add-review"
                  element={<AddReview />}
                />
              </Route>
              <Route element={<ProtectedRoute group={["Instructor"]} />}>
                <Route
                  path="/my-courses/add"
                  element={
                    <CourseProvider>
                      <CourseCreation />
                    </CourseProvider>
                  }
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
              </Route>
              <Route
                element={<ProtectedRoute group={["Admin", "Instructor"]} />}
              >
                <Route
                  path="/course/:courseId/preview"
                  element={<CoursePreviewPage />}
                />

                <Route
                  path="/dashboard/courses"
                  element={<CoursesDashboard />}
                />

                <Route path="/dashboard" element={<Dashboard />} />
                {/* <Route path="/dashboard/role" element={<Role />} />
                <Route
                  path="/dashboard/feature"
                  element={<FeatureManagment />}
                /> */}

                <Route path="/my-profile" element={<Profile />} />
              </Route>
              <Route element={<ProtectedRoute group={["Admin"]} />}>
                <Route path="/dashboard/users" element={<Users />} />
                <Route path="/dashboard/role" element={<Role />} />
                <Route
                  path="/dashboard/feature"
                  element={<FeatureManagment />}
                />
                <Route
                  path="/dashboard/payments"
                  element={<PaymentsDashboard />}
                />
              </Route>
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/role" element={<Role />} />
            <Route path="/feature" element={<FeatureManagment />} />
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
    </QueryClientProvider>
  );
}

export default App;
