/* eslint-disable react/prop-types */
import CourseCard from "../components/CourseCard";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import {
  HiArrowRight,
  HiChevronRight,
  HiMiniMagnifyingGlass,
  HiOutlineBookOpen,
  HiOutlineCheckBadge,
  HiOutlineUsers,
} from "react-icons/hi2";
import { FaAward } from "react-icons/fa";
import { useAuth } from "../context/authContext";
import { useEffect, useState } from "react";
import { getAllcourse } from "../services/apiCourse";
import { getMyEnrolledCourse } from "../services/apiEnrollment";
import { motion } from "motion/react";
import myImage from "../assets/hero-image.jpg";
import Tab from "../ui/Tab";
const steps = [
  {
    step: "01",
    title: "Choisissez votre cours",
    description:
      "Parcourez notre catalogue de milliers de cours dans tous les domaines.",
    icon: "🔍",
    color: "bg-blue-500",
  },
  {
    step: "02",
    title: "Apprenez à votre rythme",
    description:
      "Accédez aux cours n'importe où, n'importe quand, sur tous vos appareils.",
    icon: "⏱️",
    color: "bg-purple-500",
  },
  {
    step: "03",
    title: "Obtenez votre certification",
    description:
      "Complétez le cours et recevez une certification reconnue par l'industrie.",
    icon: "🏆",
    color: "bg-green-500",
  },
];

export default function HomePage() {
  const categories = ["developpment ", "science", "digital", "IA"];
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCategorie, setCategorie] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();
  const token = user.token;
  useEffect(() => {
    const fetchAllcours = async () => {
      const queryParams = new URLSearchParams();

      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      if (selectedCategorie) {
        queryParams.append("category", selectedCategorie);
      }
      const { courses } = await getAllcourse(queryParams);
      console.log(courses);
      setCourses(courses);
    };
    const fetchMyenrolledCourses = async () => {
      const data = await getMyEnrolledCourse();
      console.log(data);
      setEnrolledCourses(data);
    };
    fetchAllcours();
  }, [selectedCategorie, searchTerm]);
  const stats = [
    { value: "1M+", label: "Apprenants", icon: HiOutlineUsers },
    { value: "10K+", label: "Cours", icon: HiOutlineBookOpen },
    { value: "500+", label: "Instructeurs", icon: FaAward },
  ];
  const categorieOption = [
    { id: 1, tabName: "Toutes les catégories", type: "" },
    { id: 2, tabName: "Programmation", type: "PROGRAMMING" },
    { id: 3, tabName: "Design", type: "DESIGN" },
    { id: 4, tabName: "Marketing", type: "MARKETING" },
  ];

  return (
    <div className="flex flex-col items-center ">
      <HeroSection />
      <StatsSection stats={stats} />
      <Process />
      <FilterCourses
        selectedCategorie={selectedCategorie}
        setCategorie={setCategorie}
        categorieOption={categorieOption}
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
      />
      {courses.length > 0 ? (
        <Card className="  bg-card   flex flex-col items-start justify-between shadow-xl">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Populaire courses
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {courses.map((course) => (
              <CourseCard key={course.title} course={course} />
            ))}
          </div>
        </Card>
      ) : (
        <p>aucune résultat</p>
      )}
    </div>
  );
}

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transformez votre <span className="text-primary">avenir</span>{" "}
              avec des compétences qui comptent
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Découvrez des milliers de cours enseignés par des experts du monde
              entier et développez les compétences qui façonneront votre
              carrière.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="rounded-full px-8 bg-black text-white"
                label="Commencer maintenant"
                iconEnd={HiChevronRight}
              />
            </div>
            <div className="flex items-center mt-8 text-sm text-muted-foreground">
              <HiOutlineCheckBadge className="h-4 w-4 text-primary mr-2" />
              <span>Accès à vie aux cours</span>

              <HiOutlineCheckBadge className="h-4 w-4 text-primary mx-2 ml-4" />
              <span>Garantie satisfait</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-muted">
              <img
                src={myImage}
                alt="Plateforme d'apprentissage"
                className="w-full h-auto"
              />
              {/* Overlay avec texte */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-xl font-bold">
                  Apprenez à votre rythme
                </h3>
                <p className="text-white/80">
                  Des cours interactifs conçus pour votre réussite
                </p>
              </div>
            </div>

            {/* Éléments flottants */}
            <motion.div
              className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-3 z-20"
              animate={{ y: [0, -10, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-full p-2">
                  <HiOutlineUsers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">1M+ Apprenants</p>
                  <p className="text-xs text-muted-foreground">
                    Rejoignez la communauté
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const StatsSection = ({ stats }) => {
  return (
    <section className="py-16 bg-muted/30 w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comment fonctionne notre plateforme
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trois étapes simples pour commencer votre parcours
            d&apos;apprentissage et transformer votre carrière.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card rounded-xl p-8 shadow-sm relative z-10 h-full">
                <div
                  className={`${item.color} z-100 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl mb-6`}
                >
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-0">
                  <HiArrowRight className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FilterCourses = ({
  selectedCategorie,
  setCategorie,
  categorieOption,
  setSearchTerm,
  searchTerm,
}) => {
  return (
    <section className="py-20  mb-5 ">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Que souhaitez-vous apprendre aujourd&apos;hui ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explorez notre catalogue de plus de 10 000 cours dans tous les
              domaines et à tous les niveaux.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-8 bg-white"
          >
            <div className="relative">
              <Input
                placeholder="Rechercher un cours"
                icon={HiMiniMagnifyingGlass}
                onChange={(e) => setSearchTerm(e.target.value)} // Met à jour la recherche
                value={searchTerm}
              />
            </div>
          </motion.div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Catégories populaires</h3>
            <Tab
              tabData={categorieOption}
              field={selectedCategorie}
              setField={(type) => setCategorie(type)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
