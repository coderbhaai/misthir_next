  // import * as React from 'react';
  // import Box from '@mui/material/Box';
  // import Stepper from '@mui/material/Stepper';
  // import Step from '@mui/material/Step';
  // import StepLabel from '@mui/material/StepLabel';
  // import Typography from '@mui/material/Typography';

  // const steps = [
  //   'Order',
  //   'Payment',
  //   'Delivery',
  //   'For sweet',
  // ];

  // const stepDescriptions = [
  //   'Choose your favorite items',
  //   'Secure payment process',
  //   'Fast and reliable shipping',
  //   'You love our desserts, and we give gifts',
  // ];

  // export default function HorizontalLinearAlternativeLabelStepper() {
  //   const [activeStep, setActiveStep] = React.useState(0);

  //   const handleStepClick = (step: React.SetStateAction<number>) => {
  //     setActiveStep(step);
  //   };

  //   return (
  //     <Box sx={{ width: '100%', py: 12 }}>
  //       <Typography variant="h4" sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 6 }}>
  //         PAYMENT AND DELIVERY
  //       </Typography>

  //       <Stepper
  //         activeStep={activeStep}
  //         alternativeLabel
  //         sx={{
  //           "& .MuiStepIcon-root": {
  //             color: "#ccc", 
  //           },
  //           "& .MuiStepIcon-root.Mui-active": {
  //             color: "#1976d2", 
  //           },
  //           "& .MuiStepIcon-root.Mui-completed": {
  //             color: "#1976d2",
  //           },
  //           "& .MuiStepLabel-label.Mui-active": { color: "#1976d2", fontWeight: "semibold", fontSize: "20px"
  //           },
  //           "& .MuiStepLabel-label.Mui-completed": { color: "#1976d2",
  //           }
  //         }}
  //       >
  //         {steps.map((label, index) => (
  //           <Step key={label} onClick={() => handleStepClick(index)} sx={{ cursor: "pointer" }}>
  //             <StepLabel optional={
  //                 <Typography variant="body2" sx={{ mt: 1, color: index <= activeStep ? "#1976d2" : "text.secondary", mx: "auto"}}>
  //                   {stepDescriptions[index]}
  //                 </Typography>
  //               }>
  //               {label}
  //             </StepLabel>
  //           </Step>
  //         ))}
  //       </Stepper>
  //     </Box>
  //   );
  // }































"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";

const steps = ["Order", "Payment", "Delivery", "For sweet"];

const stepDescriptions = [
  "Choose your favorite items",
  "Secure payment process",
  "Fast and reliable shipping",
  "You love our desserts, and we give gifts",
];

const AnimatedConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    borderRadius: 2,
    backgroundColor: theme.palette.grey[400],
    backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.main})`,
    backgroundSize: "0% 100%",
    backgroundRepeat: "no-repeat",
    transition: "background-size 4s linear",
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    backgroundSize: "100% 100%",
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    backgroundSize: "100% 100%",
  },
}));

export default function LineStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [cycle, setCycle] = React.useState(0); 

  React.useEffect(() => {
    const id = setInterval(() => {
      setActiveStep((prev) => {
        if (prev === steps.length - 1) {
          setCycle((c) => c + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleStepClick = (step: number) => setActiveStep(step);

  return (
    <Box sx={{ width: "100%", py: 8 }}>
      <Typography
        variant="h4"
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 6 }}
      >
        PAYMENT AND DELIVERY
      </Typography>

      <Stepper
        key={cycle} 
        activeStep={activeStep}
        alternativeLabel
        connector={<AnimatedConnector />}
        sx={{
          "& .MuiStepIcon-root": { color: "#cfd8dc" },
          "& .MuiStepIcon-root.Mui-active": { color: "primary.main" },
          "& .MuiStepIcon-root.Mui-completed": { color: "primary.main" },
          "& .MuiStepLabel-label.Mui-active": {
            color: "primary.main",
            fontWeight: 600,
            fontSize: "1.1rem",
          },
          "& .MuiStepLabel-label.Mui-completed": { color: "primary.main" },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label} onClick={() => handleStepClick(index)} sx={{ cursor: "pointer" }}>
            <StepLabel
              optional={
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color: index <= activeStep ? "primary.main" : "text.secondary",
                    mx: "auto",
                  }}
                >
                  {stepDescriptions[index]}
                </Typography>
              }
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}


