import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Container, Grid,} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FaqProps } from '@amitkk/basic/types/page';

export interface FaqFinalProps {
  faq: FaqProps[];
}

export default function FaqPanel({ faq }: FaqFinalProps) {
  if (!faq || faq.length === 0) { return null; }

  return (
    <Grid size={12} sx={{ py: 5 }}>
      {faq?.map((i, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant='h6'>{i.question}</Typography>
          </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" component="div" dangerouslySetInnerHTML={{ __html: i.answer }}/>
            </AccordionDetails>
        </Accordion>
      ))}
    </Grid>
  );
};