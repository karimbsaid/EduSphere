/* eslint-disable react/prop-types */
import Badge from "../../../ui/Badge";
import Card from "../../../ui/Card";
import ProgressBar from "../../../components/ProgressBar";
import Button from "../../../ui/Button";
export default function CourseCard({ course }) {
  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.imageUrl || "/placeholder.svg"}
          alt={course.title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
      </div>
      <div className="flex-1 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge text={course.category} className="text-xs font-medium" />
            <span className="text-sm text-muted-foreground">
              {course.level}
            </span>
          </div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{course.progress}%</span>
          </div>
          <ProgressBar myAvance={course.progress} total={100} className="h-2" />
        </div>
      </div>
      <div className="p-5 pt-0">
        <Button label="Continue Learning" className="w-full"></Button>
      </div>
    </Card>
  );
}
