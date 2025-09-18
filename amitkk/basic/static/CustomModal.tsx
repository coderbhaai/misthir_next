import React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface CustomModalProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string | number;
  maxHeight?: string | number;
  variant?: "drawer" | "center";
}

const CustomModal: React.FC<CustomModalProps> = ({ open, handleClose, title, children, width = "50%", maxHeight = "100vh", variant = "drawer", }) => {
  const Transition = variant === "drawer" ? Slide : Fade;

  return (
    <Modal open={open} onClose={handleClose}>
      <Transition in={open} mountOnEnter unmountOnExit {...(variant === "drawer" ? { direction: "left" } : {})} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            ...(variant === "drawer"
              ? {
                  top: 0,
                  right: 0,
                  height: "100%",
                  width,
                }
              : {
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width,
                  maxHeight,
                }),
            bgcolor: "background.paper",
            borderRadius: variant === "center" ? 2 : 0,
            boxShadow: 24,
            p: 2,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ flexShrink: 0, borderBottom: "1px solid #ddd", pb: 1 }}>
            <Typography variant="h6">{title}</Typography>
            <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", pt: 2, pb: 2 }}>{children}</Box>
        </Box>
      </Transition>
    </Modal>
  );
};

export default CustomModal;