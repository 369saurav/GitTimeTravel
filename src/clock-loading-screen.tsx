import React, { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

interface ClockLoadingScreenProps {
  isLoading: boolean;
}

const ClockLoadingScreen: React.FC<ClockLoadingScreenProps> = ({ isLoading }) => {
  const secondHandControls = useAnimationControls();
  const minuteHandControls = useAnimationControls();
  const hourHandControls = useAnimationControls();
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Center point for rotations
  const centerX = 243.869;
  const centerY = 250.796;

  // Random swirling particles for time travel effect
  const particleCount = 40;
  const particles = Array.from({ length: particleCount }).map((_, i) => ({
    id: i,
    x: Math.random() * 100 - 50, // Random position
    y: Math.random() * 100 - 50,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 15,
  }));

  useEffect(() => {
    if (isLoading) {
      // Start the clock animation when loading begins
      animateClock();
      
      // Simulate loading progress
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 5;
        });
      }, 300);
      
      return () => clearInterval(interval);
    } else {
      // Stop animation when loading ends
      secondHandControls.stop();
      minuteHandControls.stop();
      hourHandControls.stop();
      setLoadingProgress(0);
    }
  }, [isLoading]);

  const animateClock = async () => {
    // Initial rotation values - start at random positions
    const initialSecondRotation = Math.floor(Math.random() * 360);
    const initialMinuteRotation = Math.floor(Math.random() * 360);
    const initialHourRotation = Math.floor(Math.random() * 360);

    // Set initial positions
    secondHandControls.set({ rotate: initialSecondRotation });
    minuteHandControls.set({ rotate: initialMinuteRotation });
    hourHandControls.set({ rotate: initialHourRotation });

    // Start continuous rotation backwards - note the negative values for backward rotation
    secondHandControls.start({
      rotate: [initialSecondRotation, initialSecondRotation - 360],
      transition: {
        duration: 10, // 10 seconds for a full rotation backwards
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });

    minuteHandControls.start({
      rotate: [initialMinuteRotation, initialMinuteRotation - 360],
      transition: {
        duration: 60, // 60 seconds for a full rotation backwards
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });

    hourHandControls.start({
      rotate: [initialHourRotation, initialHourRotation - 360],
      transition: {
        duration: 720, // 720 seconds (12 minutes) for a full rotation backwards
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
  };

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black/90 to-black/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Swirling time travel background effect */}
        <div className="absolute h-[350px] w-[350px] rounded-full bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ 
              rotate: 360,
              borderWidth: ["2px", "0px", "2px"],
              borderColor: ["rgba(78, 16, 126, 0.5)", "rgba(16, 78, 126, 0.2)", "rgba(78, 16, 126, 0.5)"]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "linear" 
            }}
          />
          
          {/* Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-blue-300"
              style={{ 
                width: particle.size,
                height: particle.size, 
                left: "calc(50% + " + particle.x + "px)",
                top: "calc(50% + " + particle.y + "px)",
              }}
              animate={{
                x: [0, -30, 30, -60, 0],
                y: [0, 40, -40, 10, 0],
                opacity: [0, 0.8, 0.4, 0.9, 0],
                scale: [0, 1, 1.5, 0.8, 0]
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8, 1],
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        {/* SVG Clock */}
        <svg
          version="1.1"
          id="clock"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="300px"
          height="300px"
          viewBox="94.257 101.184 358 401.184"
          enableBackground="new 94.257 101.184 394.257 401.184"
          className="relative z-10 drop-shadow-lg"
        >
          {/* Clock face */}
          <circle id="face" fill="#F4F3ED" cx="243.869" cy="250.796" r="130.8" />

          {/* Clock rim */}
          <path
            id="rim"
            fill="#383838"
            d="M243.869,101.184c-82.629,0-149.612,66.984-149.612,149.612c0,82.629,66.983,149.612,149.612,149.612
  S393.48,333.425,393.48,250.796S326.498,101.184,243.869,101.184z M243.869,386.455c-74.922,0-135.659-60.736-135.659-135.659
  c0-74.922,60.737-135.659,135.659-135.659c74.922,0,135.658,60.737,135.658,135.659
  C379.527,325.719,318.791,386.455,243.869,386.455z"
          />

          {/* Clock inner */}
          <g id="inner">
            <g opacity="0.2">
              <path
                fill="#C4C4C4"
                d="M243.869,114.648c-75.748,0-137.154,61.406-137.154,137.153c0,75.749,61.406,137.154,137.154,137.154
      c75.748,0,137.153-61.405,137.153-137.154C381.022,176.054,319.617,114.648,243.869,114.648z M243.869,382.56
      c-72.216,0-130.758-58.543-130.758-130.758s58.542-130.758,130.758-130.758c72.216,0,130.758,58.543,130.758,130.758
      S316.085,382.56,243.869,382.56z"
              />
            </g>
            <g>
              <path
                fill="#282828"
                d="M243.869,113.637c-75.748,0-137.154,61.406-137.154,137.153c0,75.749,61.406,137.154,137.154,137.154
      c75.748,0,137.153-61.405,137.153-137.154C381.022,175.043,319.617,113.637,243.869,113.637z M243.869,381.548
      c-72.216,0-130.758-58.542-130.758-130.757c0-72.216,58.542-130.758,130.758-130.758c72.216,0,130.758,58.543,130.758,130.758
      C374.627,323.005,316.085,381.548,243.869,381.548z"
              />
            </g>
          </g>

          {/* Clock markings */}
          <g id="markings">
            {/* Minute markings */}
            <line fill="none" stroke="#3F3F3F" strokeMiterlimit="10" x1="243.5" y1="139" x2="243.5" y2="133" />
            <line fill="none" stroke="#3F3F3F" strokeMiterlimit="10" x1="231.817" y1="139.651" x2="231.19" y2="133.684" />
            {/* More minute markings here */}
            
            {/* Hour markers */}
            <text transform="matrix(1 0 0 1 282 174.4307)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">1</text>
            <text transform="matrix(1 0 0 1 320.6987 209.9229)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">2</text>
            <text transform="matrix(1 0 0 1 335.0396 260.3213)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">3</text>
            <text transform="matrix(1 0 0 1 319.6987 311.6914)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">4</text>
            <text transform="matrix(1 0 0 1 284.5 344.7695)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">5</text>
            <text transform="matrix(1 0 0 1 235.5522 357.5293)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">6</text>
            <text transform="matrix(1 0 0 1 189.3726 343.7695)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">7</text>
            <text transform="matrix(1 0 0 1 151.0664 308.9883)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">8</text>
            <text transform="matrix(1 0 0 1 136.3916 262.6992)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">9</text>
            <text transform="matrix(1 0 0 1 149.0664 212.9229)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">10</text>
            <text transform="matrix(1 0 0 1 184.9673 179.9668)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">11</text>
            <text transform="matrix(1 0 0 1 225.7227 165.9639)" fill="#303030" fontFamily="'Futura-Medium'" fontSize="26">12</text>
          </g>

          {/* Hour hand */}
          <motion.path
            id="hours"
            fill="#3A3A3A"
            d="M242.515,270.21c-0.44,0-0.856-0.355-0.926-0.79l-3.156-19.811c-0.069-0.435-0.103-1.149-0.074-1.588
l4.038-62.009c0.03-0.439,0.414-0.798,0.854-0.798h0.5c0.44,0,0.823,0.359,0.852,0.798l4.042,62.205
c0.028,0.439-0.015,1.152-0.097,1.584l-3.712,19.623c-0.082,0.433-0.508,0.786-0.948,0.786H242.515z"
            animate={hourHandControls}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />

          {/* Minute hand */}
          <motion.path
            id="minutes"
            fill="#3A3A3A"
            d="M247.862,249.75l-2.866,24.244c-0.099,1.198-0.498,2.18-1.497,2.179c-0.999,0-1.397-0.98-1.498-2.179
	l-2.861-24.508c-0.099-1.199,3.479-93.985,3.479-93.985c0.036-1.201-0.117-2.183,0.881-2.183c0.999,0,0.847,0.982,0.882,2.183
	L247.862,249.75z"
            animate={minuteHandControls}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />

          {/* Second hand */}
          <motion.g
            id="seconds"
            animate={secondHandControls}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          >
            <line
              fill="none"
              stroke="#BF4116"
              strokeMiterlimit="10"
              x1="243.5"
              y1="143"
              x2="243.5"
              y2="266"
            />
            <circle
              fill="none"
              stroke="#BF4116"
              strokeMiterlimit="10"
              cx="243.5"
              cy="271"
              r="5"
            />
            <circle fill="#BF4116" cx="243.5" cy="251" r="3.917" />
          </motion.g>
        </svg>

        {/* Loading text with animation */}
        <motion.p
          className="mt-6 text-2xl font-medium text-white"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          Traveling back in time...
        </motion.p>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${Math.min(loadingProgress, 100)}%` }}
            initial={{ width: "0%" }}
          />
        </div>
        
        {/* Year counter animation */}
        <motion.div 
          className="mt-2 font-mono text-sm text-gray-400"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          Rewinding through commit history...
        </motion.div>
      </div>
    </div>
  );
};

export default ClockLoadingScreen;