/* eslint-disable react/prop-types */
import React from "react";
import Card from "../../ui/Card";

export default function PopulaireCours({ popularCourses }) {
  return (
    <Card>
      <div>
        <h1>Cours les plus populaires</h1>
        <h2>Basé sur le nombre d&apos;inscriptions</h2>
      </div>
      <div>
        <div className="space-y-4">
          {popularCourses.map((course, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="font-bold text-lg text-slate-400 w-6">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium">{course.title}</div>
                <div className="text-sm text-slate-500">
                  {course.instructor}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{course.students}</div>
                <div className="text-xs text-slate-500">étudiants</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
