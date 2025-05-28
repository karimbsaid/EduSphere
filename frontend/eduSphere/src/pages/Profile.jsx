import { useEffect, useRef, useState } from "react";
import { updateProfile } from "../services/apiProfile";
import { useAuth } from "../context/authContext";
import ProfileInfo from "../features/profile/ProfileInfo";
import Spinner from "../ui/Spinner";

export default function Profile() {
  const { user, setUser } = useAuth();
  const token = user.token;
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    bio: "",
  });

  const isInitialLoad = useRef(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (isInitialLoad.current) {
        setLoading(true);
      }

      if (user) {
        const { additionalDetails } = user;
        const avatar = additionalDetails.photo?.includes("res.cloudinary.com")
          ? additionalDetails.photo
          : import.meta.env.VITE_API_BASE + additionalDetails.photo;

        setProfile({
          name: user.name,
          email: user.email,
          phone: additionalDetails.contactNumber,
          avatar,
          bio: additionalDetails.bio || "",
        });
      }

      if (isInitialLoad.current) {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };

    loadProfile();
  }, [token, user]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const { user: updatedUser } = await updateProfile(formData, token);
    setUser({ ...updatedUser, token, role: user.role }); // triggers user change
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner size="lg" />
        <div className="ml-4 text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
            <p className="text-gray-500">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>

          <div className="w-full">
            <ProfileInfo profile={profile} handleSubmit={handleSubmit} />
          </div>
        </div>
      </main>
    </div>
  );
}
