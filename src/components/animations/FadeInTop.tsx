import { motion } from 'framer-motion';
import React from 'react';

export interface Props {
  children?: React.ReactNode;
}

export const FadeInTop: React.FC<Props> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};
