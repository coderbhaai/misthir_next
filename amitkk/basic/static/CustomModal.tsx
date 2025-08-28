import React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface CustomModalProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string | number;
  maxHeight?: string | number; // Add maxHeight prop
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  handleClose,
  title,
  children,
  width = '50%',
  maxHeight = '100vh' // Default to full viewport height
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Slide direction='left' in={open} mountOnEnter unmountOnExit timeout={500}>
        <Box sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width,
            height: '100%',
            maxHeight: maxHeight, // Use the maxHeight prop
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden' // Ensure parent doesn't scroll
          }}>
          {/* Header section - fixed height */}
          <Box display='flex' alignItems='center' justifyContent='space-between' sx={{ flexShrink: 0 }}>
            <Typography variant='h6'>{title}</Typography>
            <IconButton onClick={handleClose} aria-label='close' color='inherit'>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Scrollable content area */}
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            pt: 2,
            pb: 2
          }}>
            {children}
          </Box>
        </Box>
      </Slide>
    </Modal>
  );
};

export default CustomModal;