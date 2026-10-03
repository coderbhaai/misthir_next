import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useDropzone } from "react-dropzone";
import DataModal from "@amitkk/basic/admin/media/media-modal";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@amitkk/components/ui/tabs";
import { Checkbox } from "@amitkk/components/basic/checkbox";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { Button } from "@amitkk/components/button/button";
import { Card, CardContent } from "@amitkk/components/ui/card";

interface MediaItem {
  _id: string;
  path: string;
  alt?: string;
}

interface MediaPanelProps {
  user_id?: string | null;
  module: string;
  module_id?: string | null;
  onSubmitDone?: () => void; 

  onSelect?: (mediaIds: string[]) => void;
  selectedMediaIds?: string[];
}

export interface MediaPanelHandle {
  open: () => void;
  close: () => void;
}

const MediaPanel = forwardRef<MediaPanelHandle, MediaPanelProps>(
  ({ user_id, module, module_id, onSelect, selectedMediaIds = [], }, ref) => {
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
  const [mediaLimit, setMediaLimit] = useState(50);
  const [files, setFiles] = useState<File[]>([]);
  const [attachedMedia, setAttachedMedia] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);

  const initMedia = async () => {  
    try {
      const res = await apiRequest("POST", "basic/media", { function:"get_selected_media", module, module_id } );

      if (res?.data) {
        setSelectedMedia(res.data || []);
        setSelected(res.data.map((i:any)=>i._id));
        setAttachedMedia(res.data.length ? true : false );
      }
    } catch (err) { clo(err) }
  };
  
  useEffect(() => {
    if (!module || !module_id ) { setSelectedMedia([]); setSelected([]); return; }

    const fetch = async () => {
      await initMedia();
    };

    fetch();
  }, [module, module_id, open]);

  const handleDelete = async (media_id: string) => {
    if (!module || !module_id ) { setSelectedMedia([]); setSelected([]); return; }

    try {
      const res = await apiRequest("POST", "basic/media", {
        function: "detach_single_media_to_module",
        module,
        module_id,
        media_id
      });

      if (res?.data) {
        hitToastr("success", res.message);
        await initMedia();
      }
    } catch (err) { clo(err); }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchMedia = async () => {
    const res = await apiRequest("POST", `basic/media`, {
      function: 'get_all_media',
      mediaLimit
    });
    setMedia(res?.data ?? []);
  };

  useEffect(() => { fetchMedia(); }, [mediaLimit]);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append("images[]", file));
    setUploading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const toggleSelect = (id: string) => { setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id] ); };

  const handleSubmitUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images[]", file));
    formData.append("module", module);
    formData.append("function", "create_update_media_library");
    formData.append( "user_id", user_id && user_id !== "undefined" && user_id !== "null" ? user_id : "null" );

    try {
      const res = await apiRequest("POST", "basic/media", formData);

      setFiles([]);
      fetchMedia();
      hitToastr("success", res.message);
    } catch (error) { clo(error) } finally { setUploading(false); }
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editMediaId, setEditMediaId] = useState<string | null>(null);

  const attachMedia = async () => {
    if (!module || !module_id || selected.length === 0) return;

    try {
      const res = await apiRequest("POST", "basic/media", {
        function: "attach_media_to_module",
        module,
        module_id,
        media_ids: selected
      });

      if (res?.data) {
        hitToastr("success", res.message);
        await initMedia();
        if (onSelect) {
          onSelect(selected);
        }
      }
    } catch (err) { clo(err); }
  };

  const detachMedia = async () => {
    if (!module || !module_id || selected.length) return;

    try {
      const res = await apiRequest("POST", "basic/media", {
        function: "detach_media_to_module",
        module,
        module_id,
      });

      if (res?.data) {
        hitToastr("success", res.message);
        await initMedia();
      }
    } catch (err) { clo(err); }
  };

 return (
  <>
    <Button type="button" className="w-fit mx-3" onClick={() => setOpen(true)}>Open Library</Button>

    {selectedMedia.length > 0 && (
      <div className="mt-6">
        <h3 className="mb-4 text-sm font-medium">Selected Media</h3>

        <div className="row">
          {selectedMedia.map((media) => (
            <Card key={`selectedMedia-${media._id}`} className="col-span-12 md:col-span-2 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-0">
                <img src={media.path} alt={media.alt} className="h-[250px] w-full object-cover"/>
                <button type="button" onClick={() => handleDelete(media._id)} className="absolute right-2 top-2 rounded-full bg-white/80 p-1 transition hover:bg-red-500 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )}

    <CustomModal open={open} handleClose={handleClose} title="Media Library" width="100">
      <Tabs defaultValue="0" value={String(tab)} onValueChange={(v) => setTab(Number(v))} className="w-full block">
        <TabsList className="grid grid-cols-2 w-full mb-6 bg-muted p-1 rounded-lg">
          <TabsTrigger value="0" className="px-4 py-5 text-sm font-medium transition-all border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-t-transparent data-[state=active]:border-x-transparent">Upload Files</TabsTrigger>
          <TabsTrigger value="1" className="px-4 py-5 text-sm font-medium transition-all border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-t-transparent data-[state=active]:border-x-transparent">Media Library</TabsTrigger>
        </TabsList>

        <TabsContent value="0" className="block">
          <form onSubmit={handleSubmitUpload}>
            <div {...getRootProps()} className="cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/40 p-10 text-center transition hover:border-primary">
              <input {...getInputProps({
                  onChange: (
                    e: React.ChangeEvent<HTMLInputElement>
                  ) => {
                    if (e.target.files) { 
                      setFiles(Array.from(e.target.files));
                    }
                  },
                })}/>

              <h3 className="text-lg font-semibold">{files.length > 0 ? `${files.length} file(s) selected` : "Drop files here or click to select"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Max file size: 2GB</p>
            </div>

            {files.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4">
                {files.map((file, i) => {
                  const isImage = file.type.startsWith("image/");

                  return (
                    <div key={i} className="relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-md border">
                      <button type="button" onClick={() => handleRemoveFile(i)} className="absolute right-1 top-1 z-10 rounded-full bg-white/80 p-1 transition hover:bg-red-500 hover:text-white">
                        <X className="h-3 w-3" />
                      </button>

                      {isImage ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover"/>
                      ) : (
                        <p className="p-2 text-center text-xs">{file.name}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-6 text-center">
                <Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Add to Gallery"}</Button>
              </div>
            )}
          </form>
        </TabsContent>

        <TabsContent value="1" className="">
          <div className="row">
            {media.map((item) => (
              <Card key={`tab1-${item._id}`} onClick={() => toggleSelect(item._id)} className={`col-span-6 md:col-span-2 relative cursor-pointer overflow-hidden transition ${selected.includes(item._id) ? "border-4 border-primary" : "border"}`}>
                <div className="aspect-square bg-muted">
                  <img src={item.path} alt="" className="h-full w-full object-cover"/>
                </div>

                <div className="absolute right-2 top-2">
                  <Checkbox checked={selected.includes(item._id)}/>
                </div>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-center gap-3 border-t bg-background p-4 bg-white">
            <Button type="button" variant="outline" onClick={() => setMediaLimit((p) => p + 50)}>Load More</Button>
            {mediaLimit > 50 && ( <Button type="button" variant="outline" onClick={() => setMediaLimit((p) => Math.max(50, p - 50))}>Show Less</Button> )}
            {selected.length === 1 && ( <Button type="button" onClick={() => { setEditMediaId(selected[0]); setEditOpen(true); }}>Edit</Button> )}
            {selected.length > 0 && module && module_id && ( <Button type="button" variant="default" onClick={attachMedia}>Attach {selected.length} Media</Button> )}
            {attachedMedia && module && module_id && selected.length === 0 && ( <Button type="button" variant="destructive" onClick={detachMedia}>Detach All Media</Button> )}
          </div>
        </TabsContent>
      </Tabs>
    </CustomModal>

    <DataModal open={editOpen} selectedDataId={editMediaId} handleClose={() => { setEditOpen(false); setEditMediaId(null); }}
      handleUpdate={(updated) => {
        setMedia((prev) => prev.map((m) => m._id === String(updated._id) ? { ...m, ...updated, _id: String(updated._id) } : m));
        setSelectedMedia((prev) => prev.map((m) => m._id === updated._id ? { ...m, ...updated } : m));
        setEditOpen(false);
        setEditMediaId(null);
      }}/>
  </>
);
  }
);

export default MediaPanel;