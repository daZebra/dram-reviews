"use client";
import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";

type LottiImgProps = {
  imgUrl: string;
};

export default function LottiImg({ imgUrl }: LottiImgProps) {
  const animationContainer = useRef<HTMLDivElement | null>(null);
  const anim = useRef<AnimationItem | null>(null); // Correctly type the animation instance

  useEffect(() => {
    if (animationContainer.current) {
      // Initialize the animation
      anim.current = lottie.loadAnimation({
        container: animationContainer.current, // Referencing the container
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: imgUrl,
      });
    }

    // Cleanup function
    return () => {
      if (anim.current) {
        anim.current.destroy(); // Destroy the animation instance on cleanup
      }
    };
  }, [imgUrl]); // Add imgUrl to the dependency array

  return <div ref={animationContainer}></div>;
}
