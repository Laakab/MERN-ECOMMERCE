import React from 'react';
import { motion } from 'framer-motion';
import { FiUser } from 'react-icons/fi';

const ShopkeeperAvatar = () => {
  return (
    <motion.div
      className="shopkeeper-avatar"
      whileHover={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 0.5 }}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#f8d7da',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          repeatType: 'reverse', 
          duration: 2 
        }}
      >
        <FiUser size={30} color="#dc3545" />
      </motion.div>
    </motion.div>
  );
};

export default ShopkeeperAvatar;