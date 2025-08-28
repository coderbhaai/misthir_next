import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export interface FaqProps {
    question: string;
    answer: string;
}

export default function SingleFaqItem({ row }: { row: any }){
    return(
        <Accordion sx={{ mb: 0 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2-content" id="panel2-header" >
                <Typography component="h3">{ row.question }</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>{ row.answer? new DOMParser().parseFromString(row.answer, "text/html").body?.textContent || "" : "" }</Typography>
            </AccordionDetails>
        </Accordion>
    );
}