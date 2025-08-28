import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";

import SingleTestimonialItem from "./single-testimonial-item";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";

interface TestimonialModuleProps {
    module?: string;
    module_id?: string;
}

export const SuggestTestimonial: React.FC<TestimonialModuleProps> = ({ module = "", module_id = "" }) => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        if (module && module_id) {
            const fetchData = async () => {
                try {
                    const data = await apiRequest("get", `/page/get_testimonial?module=${module}&module_id=${module_id}`);
                    setData(data);
                    
                } catch (error) { clo( error ); }

            };
            fetchData();
        }
    }, []);

    return(
        <>
            <Box mb={5} sx={{ padding: "1em" }}>
                {data?.length > 0 && data?.map((i) => (
                    <SingleTestimonialItem row={i} key={i._id.toString()}/>
                ))}
            </Box>
        </>
    )
}

export default SuggestTestimonial;