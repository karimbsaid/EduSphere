"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle,
  Play,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  Star,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Catégories de cours populaires
const categories = [
  {
    name: "Développement Web",
    icon: "💻",
    count: 120,
    color: "from-blue-500 to-cyan-400",
  },
  {
    name: "Design UX/UI",
    icon: "🎨",
    count: 85,
    color: "from-purple-500 to-pink-400",
  },
  {
    name: "Marketing Digital",
    icon: "📱",
    count: 64,
    color: "from-orange-500 to-amber-400",
  },
  {
    name: "Intelligence Artificielle",
    icon: "🤖",
    count: 42,
    color: "from-emerald-500 to-teal-400",
  },
  {
    name: "Photographie",
    icon: "📷",
    count: 56,
    color: "from-indigo-500 to-blue-400",
  },
  {
    name: "Développement Personnel",
    icon: "🧠",
    count: 78,
    color: "from-rose-500 to-red-400",
  },
];

// Témoignages d'utilisateurs
const testimonials = [
  {
    name: "Sophie Martin",
    role: "Développeuse Web",
    image: "/placeholder.svg?height=100&width=100",
    content:
      "Cette plateforme a transformé ma carrière. J'ai appris le développement web en 3 mois et j'ai trouvé un emploi immédiatement après.",
    rating: 5,
  },
  {
    name: "Thomas Dubois",
    role: "Designer UX/UI",
    image: "/placeholder.svg?height=100&width=100",
    content:
      "Les cours sont incroyablement bien structurés et les instructeurs sont des experts dans leur domaine. Je recommande vivement !",
    rating: 5,
  },
  {
    name: "Émilie Lefèvre",
    role: "Étudiante",
    image: "/placeholder.svg?height=100&width=100",
    content:
      "J'ai pu compléter ma formation universitaire avec des compétences pratiques qui m'ont donné un avantage sur le marché du travail.",
    rating: 4,
  },
];

// Cours en vedette
const featuredCourses = [
  {
    id: 1,
    title: "Maîtrisez React.js en 2023",
    instructor: "Alexandre Dupont",
    image: "/placeholder.svg?height=300&width=400",
    rating: 4.9,
    students: 12453,
    price: 49.99,
    category: "Développement Web",
  },
  {
    id: 2,
    title: "Design d'Interfaces Modernes",
    instructor: "Marie Laurent",
    image: "/placeholder.svg?height=300&width=400",
    rating: 4.8,
    students: 8765,
    price: 59.99,
    category: "Design UX/UI",
  },
  {
    id: 3,
    title: "Marketing sur les Réseaux Sociaux",
    instructor: "Nicolas Bernard",
    image: "/placeholder.svg?height=300&width=400",
    rating: 4.7,
    students: 9432,
    price: 44.99,
    category: "Marketing Digital",
  },
];

// Statistiques de la plateforme
const stats = [
  { value: "1M+", label: "Apprenants", icon: Users },
  { value: "10K+", label: "Cours", icon: BookOpen },
  { value: "500+", label: "Instructeurs", icon: Award },
];

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Formes décoratives */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Badge className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                La plateforme d'apprentissage du futur
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Transformez votre <span className="text-primary">avenir</span>{" "}
                avec des compétences qui comptent
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Découvrez des milliers de cours enseignés par des experts du
                monde entier et développez les compétences qui façonneront votre
                carrière.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full px-8">
                  Commencer gratuitement
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Voir comment ça marche
                </Button>
              </div>
              <div className="flex items-center mt-8 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span>Accès à vie aux cours</span>
                <CheckCircle className="h-4 w-4 text-primary mx-2 ml-4" />
                <span>Certificats reconnus</span>
                <CheckCircle className="h-4 w-4 text-primary mx-2 ml-4" />
                <span>Garantie satisfait</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.9,
              }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-muted">
                <img
                  src="/placeholder.svg?height=600&width=800"
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
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">1M+ Apprenants</p>
                    <p className="text-xs text-muted-foreground">
                      Rejoignez la communauté
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-3 z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 4,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-secondary/10 rounded-full p-2">
                    <Award className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Certifications</p>
                    <p className="text-xs text-muted-foreground">
                      Reconnues mondialement
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Recherche de Cours */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <Badge className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                Trouvez votre prochain cours
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Que souhaitez-vous apprendre aujourd'hui ?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explorez notre catalogue de plus de 10 000 cours dans tous les
                domaines et à tous les niveaux.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un cours, une compétence ou un instructeur..."
                  className="pl-12 py-6 text-lg rounded-full shadow-md"
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full">
                  Rechercher
                </Button>
              </div>
            </motion.div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">
                Catégories populaires
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Button
                      variant="outline"
                      className="rounded-full flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
                    >
                      <span>{category.icon}</span>
                      {category.name}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select defaultValue="level">
                <SelectTrigger>
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="level">Tous les niveaux</SelectItem>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="duration">
                <SelectTrigger>
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duration">Toutes les durées</SelectItem>
                  <SelectItem value="short">Moins de 3 heures</SelectItem>
                  <SelectItem value="medium">3-10 heures</SelectItem>
                  <SelectItem value="long">Plus de 10 heures</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="price">
                <SelectTrigger>
                  <SelectValue placeholder="Prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Tous les prix</SelectItem>
                  <SelectItem value="free">Gratuit</SelectItem>
                  <SelectItem value="paid">Payant</SelectItem>
                  <SelectItem value="low">Moins de 20€</SelectItem>
                  <SelectItem value="medium">20€ - 50€</SelectItem>
                  <SelectItem value="high">Plus de 50€</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-8 text-center">
              <Button variant="link" className="text-primary">
                Options de recherche avancées
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Résultats de Recherche Rapide */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              Résultats de recherche populaires
            </h2>
            <Button variant="outline" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Voir tous les cours
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "JavaScript Moderne: De Zéro à Expert",
                instructor: "Jean Martin",
                image: "/placeholder.svg?height=200&width=300",
                rating: 4.8,
                students: 15420,
                price: 29.99,
                category: "Développement Web",
                level: "Tous niveaux",
              },
              {
                title: "Design d'Interface Utilisateur en 2023",
                instructor: "Sophie Dubois",
                image: "/placeholder.svg?height=200&width=300",
                rating: 4.9,
                students: 8765,
                price: 49.99,
                category: "Design UX/UI",
                level: "Intermédiaire",
              },
              {
                title: "Python pour la Data Science",
                instructor: "Thomas Leroy",
                image: "/placeholder.svg?height=200&width=300",
                rating: 4.7,
                students: 12340,
                price: 39.99,
                category: "Programmation",
                level: "Débutant",
              },
              {
                title: "Marketing Digital: Stratégies Complètes",
                instructor: "Marie Lambert",
                image: "/placeholder.svg?height=200&width=300",
                rating: 4.6,
                students: 7890,
                price: 59.99,
                category: "Marketing Digital",
                level: "Tous niveaux",
              },
            ].map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-white/90 text-foreground hover:bg-white/90 text-xs">
                        {course.category}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary/90 text-white hover:bg-primary/90 text-xs">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-1 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Par {course.instructor}
                    </p>
                    <div className="flex items-center text-sm mb-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                      <span className="font-medium">{course.rating}</span>
                      <span className="text-muted-foreground ml-1">
                        ({course.students.toLocaleString()})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{course.price} €</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                      >
                        Détails
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Vous ne trouvez pas ce que vous cherchez ?
            </p>
            <Button className="rounded-full px-6">
              Explorer tous les cours
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="py-16 bg-muted/30">
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

      {/* Section Catégories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              Explorer par catégorie
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Découvrez nos domaines d'expertise
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des milliers de cours dans les domaines les plus demandés pour
              développer vos compétences professionnelles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link
                  href={`/categories/${category.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  <Card className="overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div
                        className={`bg-gradient-to-r ${category.color} p-6 text-white`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-4xl">{category.icon}</span>
                          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                            {category.count} cours
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">
                          {category.name}
                        </h3>
                        <div className="flex items-center text-white/80 text-sm">
                          <span>Explorer</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              Processus simple
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment fonctionne notre plateforme
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trois étapes simples pour commencer votre parcours d'apprentissage
              et transformer votre carrière.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
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
            ].map((item, index) => (
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
                    className={`${item.color} text-white w-12 h-12 rounded-full flex items-center justify-center text-xl mb-6`}
                  >
                    {item.icon}
                  </div>
                  <div className="absolute -top-4 -left-4 text-8xl font-bold text-muted-foreground/10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-0">
                    <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Cours en vedette */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              Cours populaires
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nos cours les mieux notés
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les cours qui ont aidé des milliers d'apprenants à
              atteindre leurs objectifs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link href={`/courses/${course.id}`}>
                  <Card className="overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-foreground hover:bg-white/90">
                          {course.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Par {course.instructor}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{course.rating}</span>
                          <span className="text-muted-foreground ml-2">
                            ({course.students.toLocaleString()})
                          </span>
                        </div>
                        <span className="font-bold">{course.price} €</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="rounded-full px-8">
              Voir tous les cours
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              Témoignages
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ce que disent nos apprenants
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment notre plateforme a transformé la vie et la
              carrière de nos apprenants.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative h-80">
              <AnimatePresence mode="wait">
                {testimonials.map(
                  (testimonial, index) =>
                    currentTestimonial === index && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        <Card className="h-full flex flex-col justify-center p-8 text-center">
                          <div className="mx-auto mb-6 relative">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-background">
                              <img
                                src={testimonial.image || "/placeholder.svg"}
                                alt={testimonial.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-1">
                              <Star className="h-4 w-4 fill-current" />
                            </div>
                          </div>
                          <p className="text-lg mb-6 italic">
                            "{testimonial.content}"
                          </p>
                          <div>
                            <h4 className="font-bold">{testimonial.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {testimonial.role}
                            </p>
                          </div>
                          <div className="flex justify-center mt-4">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < testimonial.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </Card>
                      </motion.div>
                    )
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    currentTestimonial === index
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-12 text-white">
            {/* Formes décoratives */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Prêt à transformer votre avenir ?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Rejoignez plus d'un million d'apprenants qui ont déjà fait le
                premier pas vers une carrière réussie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-8"
                >
                  Commencer gratuitement
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 bg-transparent border-white text-white hover:bg-white/20"
                >
                  Voir les forfaits
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
