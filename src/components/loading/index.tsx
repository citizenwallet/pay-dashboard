import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Props {
  loading: boolean;
  width?: string;
  height?: string;
}

export const Loading = ({ loading, width, height }: Props) => {
  if (!width) width = '150px';
  if (!height) height = '150px';

  return (
    <div
      style={{
        perspective: 1000, // Adds perspective for a 3D effect
        width,
        height
      }}
    >
      {loading ? (
        <motion.div
          animate={{ rotateY: [0, 180, 360] }} // Flips the logo horizontally (Y-axis)
          transition={{
            duration: 3, // Time for a full rotation
            ease: 'easeInOut', // Smooth in and out animation
            repeat: Infinity // Infinite loop
          }}
          style={{
            transformStyle: 'preserve-3d', // Allows child elements to behave in 3D space
            width: '100%',
            height: '100%'
          }}
        >
          <Image
            src="/assets/img/logo.svg"
            alt="Logo"
            width={100}
            height={100}
          />
        </motion.div>
      ) : (
        <motion.div
          style={{
            transformStyle: 'preserve-3d', // Allows child elements to behave in 3D space
            width: '100%',
            height: '100%'
          }}
        >
          <Image
            src="/assets/img/logo.svg"
            alt="Logo"
            width={100}
            height={100}
          />
        </motion.div>
      )}
    </div>
  );
};
