/* eslint-disable react/prop-types */
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import CourseProgramme from "./CourseProgramme";
import CourseResource from "./CourseResource";
import { useParams, useNavigate } from "react-router-dom";

export default function CourseTabs({ data }) {
  const { courseId, sectionId } = useParams();
  const navigate = useNavigate();
  const handleTabChange = (value) => {
    if (value === "avis") {
      navigate(`/course/${courseId}/add-review`);
    }
  };

  return (
    <Tabs
      defaultValue="programme"
      className="mb-8"
      onTabChange={handleTabChange}
    >
      <TabsList className="mb-4">
        <TabsTrigger value="programme">Programme</TabsTrigger>
        <TabsTrigger value="resources">Resources</TabsTrigger>
        <TabsTrigger value="avis">Avis</TabsTrigger>
      </TabsList>

      <TabsContent value="programme">
        <CourseProgramme course={data.courseDetail} />
      </TabsContent>

      <TabsContent value="resources">
        <CourseResource resources={data.resources} />
      </TabsContent>

      <TabsContent value="avis"></TabsContent>
    </Tabs>
  );
}
