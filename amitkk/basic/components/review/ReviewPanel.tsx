"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { Types } from "mongoose";
import { MediaProps, ReviewProps } from "@amitkk/basic/types/page";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { Box, Stack, IconButton, Paper, Avatar, Grid, LinearProgress, Rating, Typography } from "@mui/material";

// interface User {
//   _id: string;
//   name: string;
//   email?: string;
// }

// interface Media {
//   _id: string;
//   media: string;
//   alt?: string;
// }

// interface Review {
//   _id: string;
//   user_id: UserProps;
//   rating: number;
//   review: string;
//   createdAt: string;
//   updatedAt: string;
//   mediaHub?: Media[];
// }

interface ReviewFormProps {
  reviews: ReviewProps[]; 
  module: string;
  module_id: string | Types.ObjectId;
}
  
  export default function ReviewPanel({ reviews, module, module_id }: ReviewFormProps) {
  const [starSelected, setStarSelected] = useState<number | null>(null);
  const [activeReview, setActiveReview] = useState<ReviewProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredReviews = starSelected ? reviews.filter((r) => r.rating === starSelected) : reviews;

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const total = reviews.length || 1;
    return { star, percentage: Math.round((count / total) * 100) };
  });

  const openReviewModal = (review: ReviewProps) => {
    setActiveReview(review);
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setActiveReview(null);
    setIsModalOpen(false);
  };


  const [activeIndex, setActiveIndex] = useState(0);
  const mediaList = activeReview?.mediaHub?.map((m) => m.media_id as MediaProps) || [];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <Grid size={12}>
      <Typography variant="h5" fontWeight="bold" mb={3}>{starSelected ? `${starSelected} Star Reviews` : "All Reviews"}</Typography>
      <Grid container spacing={4}>
        <Grid size={4}>
          <Typography align="center" mb={2}>{reviews.length} Total Reviews</Typography>

          <Box pr={3}>
            {starCounts.map(({ star, percentage }) => (
              <Box
                key={star}
                display="flex"
                alignItems="center"
                mb={2}
                sx={{ cursor: "pointer" }}
                onClick={() => setStarSelected(star)}
              >
                <Typography mr={1}>{star} Star</Typography>
                <Box flex={1} mx={1}>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: "grey.300",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "primary.main",
                      },
                    }}
                  />
                </Box>
                <Typography ml={1}>{percentage}%</Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        <Grid size={8}>
          {filteredReviews.map((r) => (
            <Paper key={r._id as string} variant="outlined" sx={{ p: 2, mb: 3, borderBottom: 2, borderColor: "divider", cursor: "pointer" }} onClick={() => openReviewModal(r)}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                  {r.user_id?.name?.charAt(0) || "U"}
                </Avatar>
                <Box>
                  <Typography fontWeight="600">
                    {r.user_id?.name || "Anonymous"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(r.updatedAt).toLocaleDateString("en-IN")}
                  </Typography>
                </Box>
              </Box>
              <Rating name="read-only" value={r.rating} readOnly size="small" sx={{ mb: 1 }}/>
              <Typography variant="body2" sx={{ mb: 1 }}>{r.review}</Typography>
              {r.mediaHub && r.mediaHub.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {r.mediaHub.map((m) => {
                    const media = m.media_id as MediaProps;
                    return (
                      <Image key={media._id as string} src={media.path} alt={media.alt || "Review media"} width={80} height={60} style={{ borderRadius: 6, objectFit: "cover" }}/>
                    );
                  })}
                </Box>
              )}
            </Paper>
          ))}
        </Grid>
      </Grid>
      
      <CustomModal open={isModalOpen} handleClose={closeReviewModal} title={activeReview?.user_id?.name || "Review"} variant="center">
        <Box display="flex" flexDirection="column" gap={3}>
          <Box>{activeReview?.review}</Box>

          {mediaList.length > 0 && (
            <Stack spacing={3} alignItems="center">
              <Box position="relative" display="flex" justifyContent="center" width="100%">
                <IconButton onClick={handlePrev} sx={{ position: "absolute", left: 0, top: "50%", zIndex: "100", transform: "translateY(-50%)", bgcolor: "white", "&:hover": { bgcolor: "grey.200" }, }}>
                  <ArrowBackIos />
                </IconButton>
                <Paper elevation={3} sx={{ borderRadius: 2, width: "100%", overflow: "hidden" }}>
                  <Box sx={{ position: "relative", width: "100%", height: 400, borderRadius: 2, overflow: "hidden", backgroundColor: "#000", }}>
                    <Image src={mediaList[activeIndex].path} alt={mediaList[activeIndex].alt || "Review media"} fill className="object-cover" sizes="(max-width: 768px) 100vw, 60vw"/>
                  </Box>
                </Paper>
                <IconButton onClick={handleNext} sx={{ position: "absolute", right: 0, top: "50%", zIndex: "100", transform: "translateY(-50%)", bgcolor: "white", "&:hover": { bgcolor: "grey.200" }, }}>
                  <ArrowForwardIos/>
                </IconButton>
              </Box>
              
              <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={2}>
                {mediaList.map((media, i) => (
                  <Paper key={media._id.toString()} elevation={i === activeIndex ? 4 : 1} sx={{ border: i === activeIndex ? "2px solid #1976d2" : "2px solid transparent", borderRadius: 2, overflow: "hidden", cursor: "pointer", }} onClick={() => handleThumbnailClick(i)}>
                    <Image src={media.path} alt={media.alt || "Review media"} width={100} height={70} className="object-cover"/>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          )}
        </Box>
      </CustomModal>
      </Grid>
  );
}
