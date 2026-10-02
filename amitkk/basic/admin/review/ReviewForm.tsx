"use client";

import { useEffect, useState } from "react";
import { hitToastr, apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useAuth } from "contexts/AuthContext";
import { LoginButton } from "@amitkk/basic/static/LoginButton";
import { Star, Upload, X } from "lucide-react";
import { Textarea } from "@amitkk/components/basic/textarea";
import { Button } from "@amitkk/components/button/button";

interface ReviewFormProps {
  module: string;
  module_id: string;
  onSubmitted?: () => void;
}

export default function ReviewForm({ module, module_id, onSubmitted }: ReviewFormProps) {
    const { isLoggedIn, user } = useAuth();
    const [rating, setRating] = useState<number | null>(0);
    const [review, setReview] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setFiles(Array.from(e.target.files));
    };

    const user_id = null;

    const [uploading, setUploading] = useState(false);
    useEffect(() => {
        if (isLoggedIn && user) {
          let user_id = user._id ?? ''
        }
      }, [isLoggedIn, user]);

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
            await apiRequest("POST", basic/review", formData);
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
                <LoginButton message="Please Login to Submit A Review"/>
            </>
        )
    }

  return (
    <div className="py-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-semibold">Share a Review</h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <button key={star} type="button" onClick={() => setRating(star)}>
                  <Star className={`h-6 w-6 ${star <= Number(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}/>
                </button>
              )
            )}
          </div>
          <Textarea rows={4} value={review} onChange={(e) => setReview(e.target.value)} placeholder="Your Views" required/>
          <div className="space-y-2">
            <label htmlFor="review-files">
              <Button type="button" variant="outline" asChild>
                <span><Upload className="h-4 w-4 mr-2" />Upload Images</span>
              </Button>
            </label>
            <input hidden multiple type="file" id="review-files" onChange={handleFileChange}/>
            <p className="text-xs text-muted-foreground">{files.length} file(s) selected</p>
          </div>

          {files.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {files.map(
                (file, i) => {
                  const isImage = file.type.startsWith("image/");
                  return (
                    <div key={i} className="relative w-24 h-24 border rounded-lg overflow-hidden flex items-center justify-center">
                      <button type="button" onClick={() => handleRemoveFile(i)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-red-500 hover:text-white">
                        <X className="h-3 w-3" />
                      </button>
                      {isImage ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover"/>
                      ) : (
                        <span className="text-xs p-1 text-center">{file.name}</span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}

          <Button type="submit" disabled={uploading}>{uploading ? "Submitting..." : "Submit"}</Button>
        </div>
      </form>
    </div>
  );
}
