  import * as React from 'react';
  import Box from '@mui/material/Box';
  import Stepper from '@mui/material/Stepper';
  import Step from '@mui/material/Step';
  import StepLabel from '@mui/material/StepLabel';
  import Typography from '@mui/material/Typography';

  const steps = [
    'Order',
    'Payment',
    'Delivery',
    'For sweet',
  ];

  const stepDescriptions = [
    'Choose your favorite items',
    'Secure payment process',
    'Fast and reliable shipping',
    'You love our desserts, and we give gifts',
  ];

  export default function HorizontalLinearAlternativeLabelStepper() {
    const [activeStep, setActiveStep] = React.useState(0);

    const handleStepClick = (step: React.SetStateAction<number>) => {
      setActiveStep(step);
    };

    return (
      <Box sx={{ width: '100%', py: 12 }}>
        <Typography variant="h4" sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 6 }}>
          PAYMENT AND DELIVERY
        </Typography>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            "& .MuiStepIcon-root": {
              color: "#ccc", 
            },
            "& .MuiStepIcon-root.Mui-active": {
              color: "#1976d2", 
            },
            "& .MuiStepIcon-root.Mui-completed": {
              color: "#1976d2",
            },
            "& .MuiStepLabel-label.Mui-active": { color: "#1976d2", fontWeight: "semibold", fontSize: "20px"
            },
            "& .MuiStepLabel-label.Mui-completed": { color: "#1976d2",
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={label} onClick={() => handleStepClick(index)} sx={{ cursor: "pointer" }}>
              <StepLabel optional={
                  <Typography variant="body2" sx={{ mt: 1, color: index <= activeStep ? "#1976d2" : "text.secondary", mx: "auto"}}>
                    {stepDescriptions[index]}
                  </Typography>
                }>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    );
  }
