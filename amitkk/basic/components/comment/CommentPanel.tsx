import { Avatar, Box,Button,Grid,Paper,SelectChangeEvent,Stack,TextField,Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CommentForm from "./CommentForm";
import DateFormat from "@amitkk/basic/components/static/date-format";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import { Types } from "mongoose";

interface CommentProps {
  _id: string | Types.ObjectId;
  name?: string;
  content?: string;
  createdAt?: string;
}

export default function CommentPanel({ module, module_id, module_name }: { module: string; module_id: string | Types.ObjectId; module_name?: string;  }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [data, setData] = useState<CommentProps[]>([]);

  const loadUser = useCallback(() => {
    if (typeof window !== "undefined") {
      if ( localStorage.getItem("authToken") ) {
        setLoggedIn(true);
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!module_id) return;

    try {
      const updatedData = {
        'function' : "get_comments",
        'module' : module,
        'module_id' : module_id,
      }
      const res = await apiRequest("post", `basic/comment`, updatedData);
      setData(res?.data)
    } catch (error) { clo( error ); }
  }, [module_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    loadUser();
    // const handleAuthChange = () => loadUser();
  }, [loadUser]);
  return(
    <>
      {!loggedIn ? (
        <Grid textAlign="center" sx={{ py: 4 }}>
          <Typography variant="h6" gutterBottom>Please login to share your views on {module_name}.</Typography>
          <Link href="/auth/login" color="primary">
            <Button type='submit' variant='contained' color='primary'>Go to Login</Button>
          </Link>
        </Grid>
      ) : (
      <Grid>
        <Typography variant="h6" gutterBottom textAlign="center"><strong>Share Views on {module_name}</strong></Typography>
        <Typography variant="body2" color="text.secondary" mb={3} sx={{ lineHeight: 1.8 }}>Please keep your views respectful and not include any anchors, promotional content or obscene words in them. Such comments will be definitely removed and your IP be blocked for future purpose promotional content or obscene words in them. Such comments will be</Typography>
        <CommentForm module={module} module_id={module_id}/>        
      </Grid>
      )}

      {data?.map?.((i) => (
        <Paper elevation={3} sx={{ p: 2, mb: 2, width: "100%", borderRadius: 2, display: "flex", alignItems: "flex-start", }}>
          <Avatar sx={{ bgcolor: "red", color: "white", fontWeight: 600, width: 40, height: 40, mr: 2, }}>
            {(i?.name || "A").charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={600}>{i?.name || "Anonymous"}</Typography>
              {i?.createdAt && ( <Typography variant="caption" color="text.secondary"><DateFormat date={i.createdAt} /></Typography>)}
            </Stack>
            <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>{i?.content || ""}</Typography>
          </Box>
        </Paper>
      ))}
    </>
  );
}