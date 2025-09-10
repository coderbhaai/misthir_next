import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MediaImage from "@amitkk/basic/components/static/table-image";
import { MediaProps } from "@amitkk/basic/types/page";

export default function SingleTestimonialItem({ row }: { row: any }){
    return(
        <Accordion sx={{ mb: 0 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2-content" id="panel2-header">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', }}>
                    <MediaImage media={row.media_id as MediaProps} style={{ margin: "10px" }} />
                    <Typography component="h3">{ row.name } - { row.role }</Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails>

                <Typography component="div">
  <span dangerouslySetInnerHTML={{ __html: row.content || '' }} />
</Typography>

            </AccordionDetails>
        </Accordion>
    );
}