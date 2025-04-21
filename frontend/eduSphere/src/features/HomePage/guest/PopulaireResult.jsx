/* eslint-disable react/prop-types */
import { HiArrowRight } from "react-icons/hi2";
import Button from "../../../ui/Button";
import CourseCard from "../../../components/CourseCard";

const PopulaireResult = ({ courses }) => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            Résultats de recherche populaires
          </h2>
          <Button
            label="Voir tous les cours"
            iconEnd={HiArrowRight}
            variant="outline"
            className="gap-2"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.title} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default PopulaireResult;
