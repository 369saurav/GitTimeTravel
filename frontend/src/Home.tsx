import RepoInput from "./RepoInput";

const Home = () => {
  const handleFetch = (url: string) => {
    console.log("Fetching files from:", url);
    // You will call backend here
  };

  return (
    <div className="p-8 h-full w-full bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">🎬 GitTimeTravel</h1>
      <RepoInput onFetch={handleFetch} />
    </div>
  );
};

export default Home;
