"use client";
import { useEffect, useRef } from "react";
import lottie from "lottie-web";

type LottiImgProps = {
  imgUrl: string;
};

export default function LottiImg({ imgUrl }: LottiImgProps) {
  const animationContainer = useRef(null);
  const anim = useRef(null); // Hold the animation instance

  useEffect(() => {
    // Initialize the animation
    anim.current = lottie.loadAnimation({
      container: animationContainer.current, // Referencing the container
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: imgUrl,
    });

    // Cleanup function
    return () => {
      if (anim.current) {
        anim.current.destroy(); // Destroy the animation instance on cleanup
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return <div ref={animationContainer}></div>;
}
