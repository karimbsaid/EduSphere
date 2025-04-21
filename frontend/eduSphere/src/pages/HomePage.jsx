import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  getAllcourse,
  getPopulaireCourses,
  getRecommendedCourses,
} from "../services/apiCourse";
import CourseSearchSection from "../features/HomePage/user/CourseSearchSection";
import CourseCard from "../components/CourseCard";
import Card from "../ui/Card";
import { MdSlideshow } from "react-icons/md";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import StatCard from "../features/dashboard/StatCard";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { getMyEnrolledCourse } from "../services/apiEnrollment";
import { useAuth } from "../context/authContext";
import EnrolledCourseCard from "../features/course/enrolledCourses/CourseCardEnrolled";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCoursesData, setRecommendedCoursesData] = useState([]);
  const [populaireCourses, setPopulaireCourses] = useState([]);
  const [error, setError] = useState("");

  const [recentEnrolledCourse, setRecentEnrolledCourse] = useState(null);

  const { user } = useAuth();
  const token = user.token;
  const inputRef = useRef(null);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter" && document.activeElement === inputRef.current) {
      const courseQueryUrl = `/courses?page=1&search=${inputRef.current.value}`;
      navigate(courseQueryUrl);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const fetchMyEnrolledCourses = async () => {
      try {
        setIsLoading(true);

        const reponse = await getMyEnrolledCourse(token);
        if (reponse.status === "success") {
          setEnrolledCourses(reponse.enrolledCourses);
        }
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyEnrolledCourses();
  }, [token]);

  useEffect(() => {
    const fetchPopulaireCourses = async () => {
      try {
        setIsLoading(true);

        const reponse = await getPopulaireCourses();
        if (reponse.status === "success") {
          setPopulaireCourses(reponse.courses);
        }
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopulaireCourses();
  }, []);

  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      try {
        setIsLoading(true);

        const reponse = await getRecommendedCourses(token);
        if (reponse.status === "success") {
          setRecommendedCoursesData(reponse.courses);
        }
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedCourses();
  }, [token]);
  const { coursCompleté, courEnCours } = enrolledCourses.reduce(
    (acc, cours) => {
      const progress = cours?.progress?.progressPercentage ?? 0;

      if (progress === 100) {
        acc.coursCompleté++;
      } else {
        acc.courEnCours++;
      }

      return acc;
    },
    { coursCompleté: 0, courEnCours: 0 }
  );
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      const sortedEnrolledCourses = [...enrolledCourses].sort((a, b) => {
        const dateA = new Date(a?.progress?.updatedAt ?? 0);
        const dateB = new Date(b?.progress?.updatedAt ?? 0);
        return dateB - dateA;
      });

      setRecentEnrolledCourse(sortedEnrolledCourses[0]);
    }
  }, [enrolledCourses]);

  const navigate = useNavigate();

  const handleContinueWatching = (courseId, sectionId, lectureId) => {
    const lessonUrl = `/course/${courseId}/chapter/${sectionId}/lecture/${lectureId}`;
    navigate(lessonUrl);
  };

  return (
    <div className="flex flex-col m-15 ">
      <h1 className="text-3xl font-bold mb-6">Bienvenue, {user.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recentEnrolledCourse && (
          <Card>
            <h1 className="text-xl font-bold mb-6">
              Continuer l&apos;apprentissage
            </h1>
            <div className="flex items-center gap-4">
              <MdSlideshow className="w-16 h-16 bg-blue-100 rounded-md flex items-center justify-center" />
              <div className="w-full">
                <h3 className="font-medium">
                  {recentEnrolledCourse.courseId.title}
                </h3>
                <div className="text-sm text-slate-500">
                  {recentEnrolledCourse.progress.progressPercentage}
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: recentEnrolledCourse.progress.progressPercentage,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <Button
              label="Reprendre"
              onClick={() =>
                handleContinueWatching(
                  recentEnrolledCourse.courseId._id,
                  recentEnrolledCourse.progress.currentSection,
                  recentEnrolledCourse.progress.currentLecture
                )
              }
              className="bg-black text-white w-full  "
            />
          </Card>
        )}
        <Card>
          <h1 className="text-xl font-bold mb-6">Mes statistiques</h1>
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Cours en cours" value={courEnCours} />
            <StatCard title="Cours completé" value={coursCompleté} />
          </div>
        </Card>
      </div>
      <section className="mt-15">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes cours</h2>
          <Link
            to="/my-enrolled-courses"
            className="bg-black text-white  px-4 py-2 rounded text-center block"
          >
            Voir tous mes cours
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {enrolledCourses.map((course, i) => (
            <EnrolledCourseCard
              key={i}
              course={course.courseId}
              progress={course.progress}
              contineWatching={handleContinueWatching}
            />
          ))}
        </div>
      </section>
      <section className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2 mt-5">
          <h2 className="text-2xl font-bold">Recommandés pour vous</h2>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Input
              placeholder="Rechercher des cours..."
              className="w-64"
              ref={inputRef}
            />
            <Link
              to="/courses"
              className="bg-black text-white  px-4 py-2 rounded text-center block"
            >
              Voir tous les cours
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedCoursesData.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
      <section className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2 mt-5">
          <h2 className="text-2xl font-bold">Cours Populaires</h2>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Input
              placeholder="Rechercher des cours..."
              className="w-64"
              ref={inputRef}
            />
            <Link
              to="/courses"
              className="bg-black text-white  px-4 py-2 rounded text-center block"
            >
              Voir tous les cours
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {populaireCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
      {/* <CourseSearchSection
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <div>
        <h1>les cours populaires</h1>
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div> */}
    </div>
  );
}
