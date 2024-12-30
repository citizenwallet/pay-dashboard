import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  loading?: boolean;
}

const FlipCard = ({loading} : Props) => {
  const [isFlipped, setIsFlipped] = useState(loading);

  const flipAnimation = {
    hidden: { rotateY: 0 },
    visible: { rotateY: 180 },
  };

  return (
    <div
      style={{
        perspective: 1000, // Creates the 3D-space illusion
        width: "200px",
        height: "300px",
      }}
    >
      <motion.div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "10px",
          position: "relative",
          transformStyle: "preserve-3d", // Ensures children are in 3D space
          cursor: "pointer",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Front Side */}
        <motion.div
          style={{
            backgroundColor: "#FFD700",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "10px",
            backfaceVisibility: "hidden", // Hides the back side while the front is showing
          }}
        >
          Front Side
        </motion.div>

        {/* Back Side */}
        <motion.div
          style={{
            backgroundColor: "#008080",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "10px",
            backfaceVisibility: "hidden", // Hides the front side while the back is showing
            transform: "rotateY(180deg)", // Position this side flipped initially
          }}
        >
          Back Side
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
