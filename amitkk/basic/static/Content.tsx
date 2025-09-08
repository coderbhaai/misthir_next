import DOMPurify from 'dompurify';
import { Typography } from '@mui/material';

export default function Content({ content }: { content?: string }) {
    if( !content ){ return null; }
    
    return (
        <Typography variant="body1" color="text.secondary">
        <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
        </Typography>
    );
}