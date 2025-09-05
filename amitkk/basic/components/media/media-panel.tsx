import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Box, Tabs, Tab, Typography, Grid, Checkbox, Card, CardMedia, IconButton, CardActions, } from "@mui/material";
import Button from '@mui/material/Button';
import { apiRequest, arraysEqual, clo } from "@amitkk/basic/utils/utils";
import { useDropzone } from "react-dropzone";
import CustomModal from "@amitkk/basic/static/CustomModal";
import CloseIcon from "@mui/icons-material/Close";
import { Delete } from "@mui/icons-material";

interface MediaItem {
  _id: string;
  path: string;
  alt?: string;
}

interface MediaPanelProps {
  user_id?: string | null;
  module: string;
  onSelect: (mediaIds: string[]) => void;
  selectedMediaIds?: string[]
}

export interface MediaPanelHandle {
  open: () => void;
  close: () => void;
}

const MediaPanel = forwardRef<MediaPanelHandle, MediaPanelProps>(
  ({ user_id, module, onSelect, selectedMediaIds = [] }, ref) => {
    const [open, setOpen] = useState(false);
    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
    }));

  const handleClose = () => setOpen(false);
  const [tab, setTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [perPage, setPerPage] = useState(50);
  const [files, setFiles] = useState<File[]>([]);

  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);

  const fetchSelectedMedia = async () => {  
    try {
      const ids = Array.isArray(selectedMediaIds) ? selectedMediaIds : [selectedMediaIds];

      const res = await apiRequest("post", "basic/media",{ function:"get_selected_media", ids: ids } );
      if( res?.data ){
        setSelectedMedia(res?.data || []);
        setOpen(false);
      }
    } catch (err) { clo(err) }
  };
  
  useEffect(() => {
    if (!selectedMediaIds || selectedMediaIds.length === 0) {
      setSelectedMedia([]);
      setSelected([]);
      return;
    }

    const fetch = async () => {
      await fetchSelectedMedia();
    };

    fetch();
  }, [selectedMediaIds]);

  const handleDelete = (mediaId: string) => {
    const updatedMediaIds = selectedMediaIds.filter(id => id !== mediaId);
    onSelect(updatedMediaIds);
    setSelected(updatedMediaIds);
  };

  const handleSubmitUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images[]", file));
    formData.append("module", module);
    formData.append("function", "create_update_media_library");
    formData.append("user_id", user_id as string);

    try {
      await apiRequest("post", "basic/media", formData);
      setFiles([]);
      fetchMedia();
    } catch (error) { clo(error) } finally { setUploading(false); }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchMedia = async () => {
    const res = await apiRequest("get", `basic/media?function=get_all_media&vendor_id=${user_id}&limit=${perPage}`);
    setMedia(res?.data ?? []);
  };

  useEffect(() => { fetchMedia(); }, [user_id]);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append("images[]", file));
    setUploading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Toggle media selection
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Button type='button' variant='contained' color='primary' onClick={() => setOpen(true)}>Open Library</Button>

      {selectedMedia.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle1">Selected Media</Typography>
          <Grid container spacing={2}>
            {selectedMedia.map((media) => (
              <Grid size={6} key={media._id}>
                <Card sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': {transform: 'translateY(-4px)', boxShadow: 6 }}}>
                  <CardMedia component="img" height="700" image={media.path} alt={media.alt} sx={{ objectFit: 'cover', width: '100%' }}/>
                  <IconButton size="small" onClick={() => handleDelete(media._id)} sx={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.8)", "&:hover": { background: "rgba(255,0,0,0.8)", color: "#fff" } }}><CloseIcon fontSize="small" /></IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <CustomModal open={open} handleClose={handleClose} title={"Media Library"} width={"70%"}>
        <Box>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Upload Files" />
            <Tab label="Media Library" />
          </Tabs>

          {tab === 0 && (
            <Box mt={2}>
              <form onSubmit={handleSubmitUpload}>
                <Box {...getRootProps()} sx={{ border: "2px dashed gray", p: 4, textAlign: "center", cursor: "pointer" }}>
                  <input {...getInputProps({
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files) { setFiles(Array.from(e.target.files)); }},
                    })}/>
                  <Typography variant="h6">{files.length > 0 ? `${files.length} file(s) selected` : "Drop files here or click to select"}</Typography>
                  <Typography variant="body2" color="text.secondary">Max file size: 2GB</Typography>
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
                
                {files.length > 0 && (
                  <Box mt={3} textAlign="center">
                    <Button type="submit" variant="contained" color="primary" disabled={uploading}>{uploading ? "Uploading..." : "Add to Gallery"}</Button>
                  </Box>
                )}
              </form>
            </Box>
          )}

          {tab === 1 && (
            <Box mt={2}>
              <Grid container spacing={2}>
                {media.map((item) => (
                  <Grid size={3}>
                    <Card sx={{ position: "relative", cursor: "pointer", border: selected.includes(item._id) ? "3px solid #1976d2" : "1px solid #ddd" }} onClick={() => toggleSelect(item._id)}>
                      <CardMedia component="img" height="140" image={item.path} alt={item.alt}/>
                      <Checkbox checked={selected.includes(item._id)} sx={{ position: "absolute", top: 4, right: 4, color: "white" }}/>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box mt={2} textAlign="center">
                <Button onClick={() => setPerPage((p) => p + 50)}>Load More</Button>
                {perPage > 50 && ( <Button onClick={() => setPerPage((p) => Math.max(50, p - 50))}>Show Less</Button> )}
                {selected.length > 0 && ( <Button variant="contained" sx={{ ml: 2 }} 
                onClick={() => { onSelect(selected); setOpen(false); }}>Add {selected.length} Images</Button> )}
              </Box>
            </Box>
          )}
        </Box>
      </CustomModal>
    </>
  );
  }
);

export default MediaPanel;
