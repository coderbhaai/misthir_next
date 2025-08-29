import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import SingleFaqItem from "./single-faq-item";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";

interface FaqModuleProps {
    module?: string;
    module_id?: string;
}

export const SuggestFaq: React.FC<FaqModuleProps> = ({ module = "", module_id = "" }) => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        if (module && module_id) {
            const fetchData = async () => {
                try {
                    const res = await apiRequest("get", `/page/get_faq?module=${module}&module_id=${module_id}`);
                    setData(res?.data ?? []);
                    
                } catch (error) { clo( error ); }

            };
            fetchData();
        }
    }, []);

    return(
        <>
            <Box mb={5} sx={{ padding: "1em" }}>
                {data?.length > 0 && data?.map((i) => (
                    <SingleFaqItem row={i} key={i._id.toString()}/>
                ))}
            </Box>
        </>
    )
}

export default SuggestFaq;