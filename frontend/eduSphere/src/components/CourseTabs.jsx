/* eslint-disable react/prop-types */
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import CourseProgramme from "./CourseProgramme";
import CourseResource from "./CourseResource";

export default function CourseTabs({ data }) {
  console.log(data);
  return (
    <div className="mb-8">
      <Tabs defaultValue="programme" className="w-full">
        <TabsList className=" bg-gray-100 p-1 rounded-lg mb-4  md:grid-cols-2">
          <TabsTrigger
            value="programme"
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none
                data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm
                hover:bg-gray-200 hover:text-gray-900"
          >
            Programme
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none
                data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm
                hover:bg-gray-200 hover:text-gray-900"
          >
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programme">
          <CourseProgramme
            course={data.courseDetail}
            progress={data.progress}
          />
        </TabsContent>

        <TabsContent value="resources">
          <CourseResource resources={data.resources} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
