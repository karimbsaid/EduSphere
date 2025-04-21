/* eslint-disable react/prop-types */
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/Tabs";
import EnrolledCourseCard from "../../../features/course/enrolledCourses/CourseCardEnrolled";

export default function EnrolledCourseTab({ enrolledCourses }) {
  const inProgressCourses = enrolledCourses.filter(
    (course) =>
      course.progress?.progressPercentage >= 0 &&
      course.progress?.progressPercentage < 100
  );

  const completedCourses = enrolledCourses.filter(
    (course) => course.progress?.progressPercentage === 100
  );
  console.log(inProgressCourses);
  console.log(completedCourses);
  return (
    <Tabs defaultValue="in-progress" className="mb-8">
      <TabsList className="mb-4">
        <TabsTrigger value="in-progress">En cours</TabsTrigger>
        <TabsTrigger value="completed">Terminés</TabsTrigger>
      </TabsList>

      <TabsContent value="in-progress">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inProgressCourses.map((course, i) => (
            <EnrolledCourseCard
              key={i}
              course={course.courseId}
              progress={course.progress}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="completed">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedCourses.map((course, i) => (
            <EnrolledCourseCard
              key={i}
              course={course.courseId}
              progress={course.progress}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="archived">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Contenu */}
        </div>
      </TabsContent>
    </Tabs>
  );
}
