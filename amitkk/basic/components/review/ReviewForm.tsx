"use client";

import { useState } from "react";
import { Box, Button, Typography, Rating, TextField, IconButton, Grid, } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/utils";
import { getUserId } from "contexts/AuthContext";
import { Types } from "mongoose";
import LoginButton from "@amitkk/basic/static/LoginButton";
import CloseIcon from "@mui/icons-material/Close";

interface ReviewFormProps {
  module: string;
  module_id: string | Types.ObjectId;
  onSubmitted?: () => void;
}

export default function ReviewForm({ module, module_id, onSubmitted }: ReviewFormProps) {
    const [rating, setRating] = useState<number | null>(0);
    const [review, setReview] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setFiles(Array.from(e.target.files));
    };

    const [uploading, setUploading] = useState(false);
    const user_id = getUserId();

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if ( !rating ){ hitToastr('error', "Rating is required"); return; }
        if ( !review ){ hitToastr('error', "Review is required"); return; }

        setUploading(true);
        const formData = new FormData();
        files.forEach((file) => formData.append("images[]", file));
        formData.append("function", "create_update_review");
        formData.append("module", module);
        formData.append("module_id", module_id as string);
        formData.append("user_id", user_id || "");
        formData.append("review", review);
        formData.append("rating", String(rating ?? 0));

        try {
            const res = await apiRequest("post", "basic/review", formData);
            if( res?.data ){
                setFiles([]);
                setReview("");
                setRating(0);
                onSubmitted?.();
            }

        } catch (error) { clo(error); } finally { setUploading(false); }
    };

    if( !user_id ){
        return (
            <>
                <LoginButton/>
            </>
        )
    }

  return (
    <Grid size={12} sx={{ py: 5 }}>
        <form onSubmit={handleSubmit}>
            <Box sx={{ p: 3, border: "1px solid #ddd", borderRadius: 2, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Share a Review</Typography>
                <Rating value={rating} onChange={(_, newValue) => setRating(newValue)} sx={{ mb: 2 }}/>
                <TextField fullWidth multiline rows={4} value={review} onChange={(e) => setReview(e.target.value)} placeholder="Your Views" sx={{ mb: 2 }} required/>
                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" component="label" startIcon={<PhotoCamera />}> Upload Images <input type="file" hidden multiple onChange={handleFileChange} /> </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>{files.length} file(s) selected</Typography>
                </Box>

                {files.length > 0 && (
                  <Box mt={3} display="flex" flexWrap="wrap" gap={2}>
                    {files.map((file, i) => {
                      const isImage = file.type.startsWith("image/");
                      return (
                        <Box key={i} sx={{ width: 100, height: 100, border: "1px solid #ccc", borderRadius: 2, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <IconButton size="small" onClick={() => handleRemoveFile(i)} sx={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.8)", "&:hover": { background: "rgba(255,0,0,0.8)", color: "#fff" } }}><CloseIcon fontSize="small" /></IconButton>
                          {isImage ? (
                            <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                          ) : (
                            <Typography variant="caption" textAlign="center" sx={{ p: 1 }}>{file.name}</Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}

                <Button variant="contained" type="submit" color="primary" disabled={loading}>{loading ? "Submitting..." : "Submit"}</Button>
            </Box>
        </form>
    </Grid>
  );
}
