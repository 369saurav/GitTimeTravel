import { Player } from "@lottiefiles/react-lottie-player";

interface LottieLoadingScreenProps {
  isLoading: boolean;
}

const LottieLoadingScreen = ({ isLoading }: LottieLoadingScreenProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <Player
        autoplay
        loop
        src="/CatLoadingAnimation.json" // ✅ Direct URL
        style={{ height: '150px', width: '150px' }}
        />
    </div>
  );
};

export default LottieLoadingScreen;
