import Spinner from "../ui/Spinner";

const Loading = () => (
  <div className="flex justify-center items-center min-h-[200px] bg-gray-100">
    <Spinner size="lg" />
    <div className="ml-4 text-lg">Chargement...</div>
  </div>
);
export default Loading;
