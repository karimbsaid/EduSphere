import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../ui/Card";
import { HiCheckCircle, HiStar } from "react-icons/hi2";
import Button from "../../ui/Button";
import { createReview, getCourseReviews } from "../../services/apiReview";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import Loading from "../../components/Loading";

const AddReview = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { courseId } = useParams();
  const { user } = useAuth();
  const token = user?.token;

  useEffect(() => {
    const fetchExistingReview = async () => {
      const data = await getCourseReviews(courseId);
      const userReview = data.reviews.find(
        (review) => review.student._id === user._id
      );
      if (userReview) {
        setExistingReview(userReview);
        setIsSubmitted(true);
      }
      setIsLoading(false);
    };

    if (user && courseId) {
      fetchExistingReview();
    }
  }, [user, courseId]);

  if (isLoading) {
    return <Loading />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !reviewText.trim()) {
      alert("Veuillez attribuer une note et un commentaire.");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await createReview(courseId, token, {
        rating,
        comment: reviewText,
      });

      setIsSubmitted(true);
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  const handleReturn = () => {
    onClose(); // Ferme le modal après soumission
  };

  return (
    <div className="p-4">
      {isSubmitted && existingReview ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-blue-300 bg-blue-50 text-center p-6 rounded-lg shadow-md">
            <HiCheckCircle className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-blue-700 mb-2">
              Vous avez déjà donné votre avis.
            </h2>
            <div className="mb-2 text-lg">Note: {existingReview.rating} ⭐</div>
            <p className="italic">"{existingReview.comment}"</p>
            <Button
              label="Retourner au cours"
              className="mt-4"
              onClick={handleReturn}
            />
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
              label={!isSubmitting ? "Envoi" : "Soumettre"}
            />
          </form>
        </Card>
      )}
    </div>
  );
};

export default AddReview;
