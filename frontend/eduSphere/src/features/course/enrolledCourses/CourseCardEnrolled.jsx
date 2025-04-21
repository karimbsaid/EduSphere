/* eslint-disable react/prop-types */
import Badge from "../../../ui/Badge";
import Card from "../../../ui/Card";
import ProgressBar from "../../../components/ProgressBar";
import Button from "../../../ui/Button";
export default function CourseCard({ course, progress, contineWatching }) {
  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md max-w-[400px]">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.imageUrl || "/placeholder.svg"}
          alt={course.title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
        <Badge
          text="développment"
          style="absolute top-0 bg-gray-100 right-0 text-black transform -translate-x-1 translate-y-1"
        />
      </div>
      <div className="flex-1 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Badge
            text={course.category}
            className="text-xs font-semibold bg-primary/20 text-primary px-3 py-1 rounded-full"
          />
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {course.level}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-xl text-gray-900 leading-tight line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3">
            {course.description}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Progression</span>
            <span className="text-primary font-semibold">
              {progress.progressPercentage}%
            </span>
          </div>
          <ProgressBar
            myAvance={progress.progressPercentage}
            total={100}
            className="h-2 rounded-full"
            barClassName="bg-primary rounded-full"
          />
        </div>
      </div>
      <div className="p-5 pt-0">
        <Button
          label="Continuer l'apprentissage"
          onClick={() =>
            contineWatching(
              course._id,
              progress.currentSection,
              progress.currentLecture
            )
          }
          className="w-full bg-black hover:bg-gray-800 text-white transition-colors shadow-sm hover:shadow-md"
        />
      </div>
    </Card>
  );
}

/* Composant Card amélioré */
