import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const textVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated 404 Text */}
      <motion.h1
        className="text-9xl font-bold text-gray-800 mb-4"
        variants={textVariants}
      >
        404
      </motion.h1>

      {/* Message */}
      <motion.p className="text-2xl text-gray-600 mb-8" variants={textVariants}>
        Oops! The page you're looking for doesn't exist.
      </motion.p>

      {/* Home Button */}
      <motion.button
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => navigate("/")}
      >
        Go Back Home
      </motion.button>

      {/* Optional: Animated Illustration */}
      <motion.div
        className="mt-12"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1, delay: 0.5, type: "spring" }}
      >
        <img
          src="https://cdn.lottiefiles.com/private_files/lf30_obidsi0t.json"
          alt="404 Illustration"
          className="w-64 h-64"
        />
      </motion.div>
    </motion.div>
  );
};

export default NotFoundPage;
