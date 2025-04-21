/* eslint-disable react/prop-types */
import React from "react";
import Card from "../../ui/Card";

export default function PopulaireInstructor({ topInstructors }) {
  return (
    <Card>
      <div>
        <h1>Instructeurs les plus performants</h1>
        <h2>Basé sur les revenus générés</h2>
      </div>
      <div>
        <div className="space-y-4">
          {topInstructors.map((instructor, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="font-bold text-lg text-slate-400 w-6">
                {index + 1}
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={instructor.avatar}
                  alt={instructor.name}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium">{instructor.name}</div>
                <div className="text-sm text-slate-500">
                  {instructor.courses} cours
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{instructor.revenue}</div>
                <div className="text-xs text-slate-500">revenus</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
