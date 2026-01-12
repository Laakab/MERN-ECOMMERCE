import React from 'react';
import { Button } from 'react-bootstrap';
import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ChatBubble = ({ message, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="position-relative p-3 rounded bg-light shadow-sm"
      style={{
        maxWidth: '80%',
        borderTopLeftRadius: '0'
      }}
    >
      <p className="mb-0">{message}</p>
      <Button 
        variant="link" 
        onClick={onClose}
        className="position-absolute top-0 end-0 p-1"
      >
        <FiX size={16} />
      </Button>
    </motion.div>
  );
};

export default ChatBubble;