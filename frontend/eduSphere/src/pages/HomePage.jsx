import CourseCard from "../components/CourseCard";
import Button from "../ui/Button";
import Card from "../ui/Card";
import FilterCategories from "../components/FilterCategory";
import Input from "../ui/Input";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useAuth } from "../context/authContext";
import { useEffect, useState } from "react";
import { getAllcourse } from "../services/apiCourse";
import { getMyEnrolledCourse } from "../services/apiEnrollment";

export default function HomePage() {
  const categories = ["developpment ", "science", "digital", "IA"];
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const { user } = useAuth();
  const token = user.token;
  useEffect(() => {
    const fetchAllcours = async () => {
      const courses = await getAllcourse();
      console.log(courses);
      // setCourses(courses);
    };
    const fetchMyenrolledCourses = async () => {
      const data = await getMyEnrolledCourse();
      console.log(data);
      setEnrolledCourses(data);
    };
    fetchAllcours();
  }, []);
  // const courses = [
  //   {
  //     title: "react development",
  //     coverImage: {
  //       url: "https://phpreaction.com/wp-content/uploads/2018/06/React_logo_wordmark.png",
  //     },
  //     level: "Beginner",
  //     instructor: {
  //       name: "karim",
  //       additionalDetails: {
  //         photo:
  //           "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRW4A7U_-p0YVaW4AXeq0LOqucj0ludkVVUQ&s",
  //       },
  //     },
  //     studentN: 200,
  //     slug: "react-course",
  //   },
  //   {
  //     title: "react development",
  //     coverImage: {
  //       url: "https://phpreaction.com/wp-content/uploads/2018/06/React_logo_wordmark.png",
  //     },
  //     level: "Beginner",
  //     instructor: {
  //       name: "karim",
  //       additionalDetails: {
  //         photo:
  //           "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRW4A7U_-p0YVaW4AXeq0LOqucj0ludkVVUQ&s",
  //       },
  //     },
  //     studentN: 200,
  //     slug: "react-course",
  //   },
  //   {
  //     title: "react development",
  //     coverImage: {
  //       url: "https://phpreaction.com/wp-content/uploads/2018/06/React_logo_wordmark.png",
  //     },
  //     level: "Beginner",
  //     instructor: {
  //       name: "karim",
  //       additionalDetails: {
  //         photo:
  //           "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRW4A7U_-p0YVaW4AXeq0LOqucj0ludkVVUQ&s",
  //       },
  //     },
  //     studentN: 200,
  //     slug: "react-course",
  //   },
  //   {
  //     title: "react development",
  //     coverImage: {
  //       url: "https://phpreaction.com/wp-content/uploads/2018/06/React_logo_wordmark.png",
  //     },
  //     level: "Beginner",
  //     instructor: {
  //       name: "karim",
  //       additionalDetails: {
  //         photo:
  //           "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRW4A7U_-p0YVaW4AXeq0LOqucj0ludkVVUQ&s",
  //       },
  //     },
  //     studentN: 200,
  //     slug: "react-course",
  //   },
  //   {
  //     title: "react development",
  //     coverImage: {
  //       url: "https://phpreaction.com/wp-content/uploads/2018/06/React_logo_wordmark.png",
  //     },
  //     level: "Beginner",
  //     instructor: {
  //       name: "karim",
  //       additionalDetails: {
  //         photo:
  //           "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRW4A7U_-p0YVaW4AXeq0LOqucj0ludkVVUQ&s",
  //       },
  //     },
  //     studentN: 200,
  //     slug: "react-course",
  //   },
  // ];
  return (
    <div className="flex flex-col items-center ">
      <Card className="w-full max-w-4xl h-auto bg-white  flex flex-col items-center justify-between shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mt-12">
          Welcome to Our Online Education Platform
        </h1>
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 tracking-wide uppercase mt-2">
          &ldquo;EduSphere&rdquo;
        </h1>

        <blockquote className="prose prose-lg italic text-gray-700 text-center mt-2 border-l-4 border-blue-500 pl-4">
          Your success is our responsibility
        </blockquote>

        <div className="flex justify-center mt-6">
          <Button
            label="Get Started Now!"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-center">
          <Card>
            <h1 className="text-xl font-semibold text-gray-800">
              +200 Students
            </h1>
          </Card>
          <Card>
            <h1 className="text-xl font-semibold text-gray-800">
              +20 Instructors
            </h1>
          </Card>
          <Card>
            <h1 className="text-xl font-semibold text-gray-800">
              +200 Courses
            </h1>
          </Card>
        </div>

        <div className="flex justify-center mt-6"></div>
      </Card>
      <Card className="my-4">
        <Input
          placeholder="Search for courses..."
          icon={HiMagnifyingGlass}
          className="w-full max-w-md border-gray-300 my-4"
        />
        <p1 className="font-semibold text-l">filter course par category</p1>
        <FilterCategories
          categories={categories}
          onFilter={(data) => console.log(data)}
        />
      </Card>
      <Card className="w-full max-w-4xl h-auto bg-white  flex flex-col items-start justify-between shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Populaire courses
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {courses.map((course) => (
            <CourseCard key={course.title} course={course} />
          ))}
        </div>
      </Card>
    </div>
  );
}
