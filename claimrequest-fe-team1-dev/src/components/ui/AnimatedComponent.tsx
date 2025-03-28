import { motion } from "framer-motion";
import React, { ReactNode } from "react";

interface AnimatedComponentProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const AnimatedComponent: React.FC<AnimatedComponentProps> = ({
  children,
  delay = 0,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "tween",
        ease: "easeOut",
        duration: 0.4,
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedComponent;
