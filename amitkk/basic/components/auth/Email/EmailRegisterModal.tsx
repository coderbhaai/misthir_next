import React, { useEffect, useState } from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import { Box, Stack, Button } from '@mui/material';

export interface DataProps {
  role: string;
  attachUser?: boolean;
  saveUser?: boolean;
  onUpdate: () => void;
}

type DataFormProps = DataProps & {
  module: string;
  open: boolean;
};

const MODULE_TITLES: Record<DataFormProps["module"], string> = {
  "Register": "Create an Account",
  "Login": "Welcome Back, Login",
  "Forgot Password": "Recover Your Account",
  "Reset Password": "Reset Your Password",
};

const MODULES: DataFormProps["module"][] = [
  "Register",
  "Login",
  "Forgot Password",
  "Reset Password",
];

export default function EmailRegisterModal({ module, role="User", open, attachUser = false, saveUser= true, onUpdate }: DataFormProps) {
  const [moduleSelected, setModuleSelected] = useState<string>(module);
  useEffect(() => { setModuleSelected(module); }, [module]);

  return (
    <CustomModal open={open} handleClose={onUpdate} title={MODULE_TITLES[moduleSelected]}>
      {
        moduleSelected == "Register" ?(
          <RegisterForm role = { role } handleClose={onUpdate} attachUser saveUser onUpdate={onUpdate}/>
        ):moduleSelected == "Login" ?(
          <LoginForm role = { role } handleClose={onUpdate} attachUser saveUser onUpdate={onUpdate}/>
        ): moduleSelected == "Forgot Password" ?(
          <ForgotPassword role = "" handleClose={onUpdate} attachUser saveUser onUpdate={() => setModuleSelected("Reset Password")}/>
        ):  moduleSelected == "Reset Password" ?(
          <ResetPassword role = "" handleClose={onUpdate} attachUser saveUser onUpdate={() => setModuleSelected("Login")}/>
        ): 
        null
      }

      <Box sx={{ mt: 3, textAlign: "center" }}>
  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
    {MODULES.map((m) => (
      <Button
        key={m}
        variant={m === moduleSelected ? "contained" : "outlined"} // 🔑 highlight active
        size="small"
        onClick={() => setModuleSelected(m)}
        sx={{
          textTransform: "none",
          bgcolor: m === moduleSelected ? "primary.main" : "transparent",
          color: m === moduleSelected ? "white" : "text.primary",
          "&:hover": {
            bgcolor: m === moduleSelected ? "primary.dark" : "grey.100",
          },
        }}
      >
        {m}
      </Button>
    ))}
  </Stack>
</Box>

    </CustomModal>
  );
};
