import { useState } from "react";
import { motion } from "framer-motion";
import Card from "../ui/Card";
import { HiCheckCircle, HiStar } from "react-icons/hi2";
import Button from "../ui/Button";
import { createReview } from "../services/apiReview";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";

const AddReview = () => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { courseId } = useParams();
  const { user } = useAuth();
  const token = user?.token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !reviewText.trim()) {
      alert("Veuillez attribuer une note et un commentaire.");
      return;
    }
    setIsSubmitting(true);

    const reponse = await createReview(courseId, token, {
      rating,
      comment: reviewText,
    });
    if (reponse.status === "success") {
      setIsSubmitted(true);
    } else {
      setIsSubmitted(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-green-300 bg-green-50 text-center p-6 rounded-lg shadow-md">
            <HiCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              Merci pour votre avis !
            </h2>
            <Button label="Retourner au cours" className="mt-4" />
          </Card>
        </motion.div>
      ) : (
        <Card className="p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-4">Évaluer ce cours</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">Note globale</h2>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                  >
                    <HiStar
                      className={`h-8 w-8 transition-colors duration-200 cursor-pointer ${
                        rating >= value ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-medium">Commentaire</h2>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full h-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Partagez votre expérience..."
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white"
              label={`${!isSubmitting ? "Envoi" : "Soumettre"}`}
            />
          </form>
        </Card>
      )}
    </div>
  );
};

export default AddReview;
