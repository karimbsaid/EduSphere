import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  getPopulaireCourses,
  getRecommendedCourses,
} from "../services/apiCourse";
import CourseCard from "../components/CourseCard";
import Card from "../ui/Card";
import { MdSlideshow } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import StatCard from "../features/dashboard/StatCard";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { getMyEnrolledCourse } from "../services/apiEnrollment";
import { useAuth } from "../context/authContext";
import EnrolledCourseCard from "../features/course/enrolledCourses/CourseCardEnrolled";
import Spinner from "../ui/Spinner";

export default function HomePage() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCoursesData, setRecommendedCoursesData] = useState([]);
  const [populaireCourses, setPopulaireCourses] = useState([]);
  const [error, setError] = useState("");
  const [enrolledLoading, setEnrolledLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [populaireLoading, setPopulaireLoading] = useState(true);
  const [recentEnrolledCourse, setRecentEnrolledCourse] = useState(null);

  const { user } = useAuth();
  const token = user?.token;
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" &&
        document.activeElement === inputRef.current
      ) {
        const courseQueryUrl = `/courses?page=1&search=${encodeURIComponent(
          inputRef.current.value
        )}`;
        navigate(courseQueryUrl);
      }
    },
    [navigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const fetchMyEnrolledCourses = async () => {
      try {
        setEnrolledLoading(true);
        const response = await getMyEnrolledCourse(token);
        if (response.status === "success") {
          setEnrolledCourses(response.enrolledCourses || []);
        }
      } catch (error) {
        setError(error.message || "Échec du chargement des cours inscrits");
      } finally {
        setEnrolledLoading(false);
      }
    };

    if (token) {
      fetchMyEnrolledCourses();
    } else {
      setEnrolledLoading(false);
      setEnrolledCourses([]);
    }
  }, [token]);

  useEffect(() => {
    const fetchPopulaireCourses = async () => {
      try {
        setPopulaireLoading(true);
        const response = await getPopulaireCourses();
        if (response.status === "success") {
          setPopulaireCourses(response.courses || []);
        }
      } catch (error) {
        setError(error.message || "Échec du chargement des cours populaires");
      } finally {
        setPopulaireLoading(false);
      }
    };

    fetchPopulaireCourses();
  }, []);

  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      try {
        setRecommendedLoading(true);
        const response = await getRecommendedCourses(token);
        if (response.status === "success") {
          setRecommendedCoursesData(response.courses || []);
        }
      } catch (error) {
        setError(error.message || "Échec du chargement des cours recommandés");
      } finally {
        setRecommendedLoading(false);
      }
    };

    if (token) {
      fetchRecommendedCourses();
    } else {
      setRecommendedLoading(false);
      setRecommendedCoursesData([]);
    }
  }, [token]);

  useEffect(() => {
    if (!enrolledLoading && enrolledCourses.length > 0) {
      const sortedEnrolledCourses = [...enrolledCourses].sort((a, b) => {
        const dateA = new Date(a?.progress?.updatedAt ?? 0);
        const dateB = new Date(b?.progress?.updatedAt ?? 0);
        return dateB - dateA;
      });
      setRecentEnrolledCourse(sortedEnrolledCourses[0] || null);
    } else {
      setRecentEnrolledCourse(null);
    }
  }, [enrolledCourses, enrolledLoading]);

  const { coursCompleté, courEnCours } = enrolledCourses.reduce(
    (acc, cours) => {
      const progress = cours?.progress?.progressPercentage ?? 0;
      if (progress === 100) {
        acc.coursCompleté++;
      } else if (progress > 0) {
        acc.courEnCours++;
      }
      return acc;
    },
    { coursCompleté: 0, courEnCours: 0 }
  );

  const handleContinueWatching = (courseId, sectionId, lectureId) => {
    console.log(courseId, sectionId, lectureId);
    if (courseId && sectionId && lectureId) {
      const lessonUrl = `/course/${courseId}/chapter/${sectionId}/lecture/${lectureId}`;
      navigate(lessonUrl);
    }
  };

  const LoadingComponent = () => (
    <div className="flex justify-center items-center min-h-[200px] bg-gray-100">
      <Spinner size="lg" />
      <div className="ml-4 text-lg">Chargement...</div>
    </div>
  );

  return (
    <div className="flex flex-col mx-6 my-10">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <h1 className="text-3xl font-bold mb-6">
        Bienvenue, {user?.name || "Utilisateur"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrolledLoading ? (
          <LoadingComponent />
        ) : recentEnrolledCourse && recentEnrolledCourse.courseId ? (
          <Card>
            <h1 className="text-xl font-bold mb-6">
              Continuer l'apprentissage
            </h1>
            <div className="flex items-center gap-4">
              <MdSlideshow className="w-16 h-16 bg-blue-100 rounded-md flex items-center justify-center" />
              <div className="w-full">
                <h3 className="font-medium">
                  {recentEnrolledCourse.courseId.title || "Cours sans titre"}
                </h3>
                <div className="text-sm text-slate-500">
                  Progression:{" "}
                  {recentEnrolledCourse.progress?.progressPercentage || 0}%
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        recentEnrolledCourse.progress?.progressPercentage || 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <Button
              label="Reprendre"
              onClick={() =>
                handleContinueWatching(
                  recentEnrolledCourse.courseId._id,
                  recentEnrolledCourse.progress?.currentSection ||
                    recentEnrolledCourse.progress.completedSections[0],
                  recentEnrolledCourse.progress?.currentLecture ||
                    recentEnrolledCourse.progress.completedLectures[0]
                )
              }
              className="bg-black text-white w-full mt-4"
              // disabled={
              //   !recentEnrolledCourse.progress?.currentSection ||
              //   !recentEnrolledCourse.progress?.currentLecture
              // }
            />
          </Card>
        ) : (
          <Card>
            <h1 className="text-xl font-bold mb-6">Aucun cours récent</h1>
            <p>
              Commencez à explorer nos cours pour continuer votre apprentissage
              !
            </p>
            <Link
              to="/courses"
              className="bg-black text-white px-4 py-2 rounded mt-4 inline-block"
            >
              Découvrir les cours
            </Link>
          </Card>
        )}

        <Card>
          <h1 className="text-xl font-bold mb-6">Mes statistiques</h1>
          {enrolledLoading ? (
            <LoadingComponent />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Cours en cours" value={courEnCours} />
              <StatCard title="Cours complétés" value={coursCompleté} />
            </div>
          )}
        </Card>
      </div>

      <section className="mt-10">
        {enrolledLoading ? (
          <LoadingComponent />
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Mes cours inscrits</h2>
              {enrolledCourses.length > 0 && (
                <Link
                  to="/my-enrolled-courses"
                  className="bg-black text-white px-4 py-2 rounded text-center block mt-2 md:mt-0"
                >
                  Voir tous mes cours inscrits
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => (
                  <EnrolledCourseCard
                    key={course.courseId?._id || Math.random()} // Fallback key si _id est absent
                    course={course.courseId || {}}
                    progress={course.progress || {}}
                    continueWatching={handleContinueWatching}
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  Aucun cours inscrit pour le moment.
                </p>
              )}
            </div>
          </>
        )}
      </section>

      <section className="my-12">
        {recommendedLoading ? (
          <LoadingComponent />
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
              <h2 className="text-2xl font-bold">Recommandés pour vous</h2>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <Input
                  placeholder="Rechercher des cours..."
                  className="w-64"
                  ref={inputRef}
                />
                <Link
                  to="/courses"
                  className="bg-black text-white px-4 py-2 rounded text-center block"
                >
                  Voir tous les cours
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCoursesData.length > 0 ? (
                recommendedCoursesData.map((course) => (
                  <CourseCard
                    key={course._id || Math.random()}
                    course={course || {}}
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  Aucun cours recommandé pour le moment.
                </p>
              )}
            </div>
          </>
        )}
      </section>

      <section className="my-12">
        {populaireLoading ? (
          <LoadingComponent />
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
              <h2 className="text-2xl font-bold">Cours populaires</h2>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <Input
                  placeholder="Rechercher des cours..."
                  className="w-64"
                  ref={inputRef}
                />
                <Link
                  to="/courses"
                  className="bg-black text-white px-4 py-2 rounded text-center block"
                >
                  Voir tous les cours
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {populaireCourses.length > 0 ? (
                populaireCourses.map((course) => (
                  <CourseCard
                    key={course._id || Math.random()}
                    course={course || {}}
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  Aucun cours populaire pour le moment.
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
