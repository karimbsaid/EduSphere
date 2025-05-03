/* eslint-disable react/prop-types */
import { HiArrowRight } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../../../ui/Card";
import Badge from "../../../ui/Badge";

const categoryIcons = {
  PROGRAMMING: "💻",
  DESIGN: "🎨",
  BUSINESS: "📱",
  MARKETING: "📊",
};

const categoryColors = {
  PROGRAMMING: "bg-gradient-to-r from-blue-500 to-cyan-400",
  DESIGN: "bg-gradient-to-r from-purple-500 to-pink-400",
  BUSINESS: "bg-gradient-to-r from-orange-500 to-amber-400",
  MARKETING: "bg-gradient-to-r from-green-500 to-teal-400",
};

const CategorySection = ({ coursesByCategory = [] }) => {
  const navigate = useNavigate();

  const handleExploreCourses = (category) => {
    const courseQueryUrl = `/courses?page=1&category=${category}`;
    navigate(courseQueryUrl);
  };
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge
            text="Explorer par catégorie"
            className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20"
          />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Découvrez nos domaines d&apos;expertise
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des milliers de cours dans les domaines les plus demandés pour
            développer vos compétences professionnelles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesByCategory.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card
                className={`overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow text-white ${
                  categoryColors[category._id] ||
                  "bg-gradient-to-r from-gray-500 to-gray-400"
                } p-6`}
                onClick={() => handleExploreCourses(category._id)}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-4xl">
                    {categoryIcons[category._id] || "📚"}
                  </span>
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    {category.totalCourses} cours
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{category._id}</h3>
                <div className="flex items-center text-white/80 text-sm">
                  <span>Explorer</span>
                  <HiArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
