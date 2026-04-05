import React, { useEffect, useRef, useState } from "react";

const Reveal = ({ children, delay = 0, direction = "up", threshold = 0.1, rootMargin = "0px 0px -50px 0px" }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const getTransform = () => {
    switch (direction) {
      case "up": return "translateY(60px)";
      case "down": return "translateY(-60px)";
      case "left": return "translateX(-60px)";
      case "right": return "translateX(60px)";
      case "scale": return "scale(0.9)";
      default: return "translateY(0)";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0, 0) scale(1)" : getTransform(),
        transition: `all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default Reveal;
