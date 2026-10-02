"use client";

import React from "react";

// Editors
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then(mod => mod.CKEditor),
  { ssr: false }
);
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import dynamic from "next/dynamic";


// import CKEditor from "ckeditor4-react";

interface RichTextEditorProps {
  label?: string;
  name: string;
  value?: string;
  required?: boolean;
  error?: string | null;
  onChange: (name: string, value: string) => void;
}

const DEFAULT_EDITOR = "ckeditor5" as "ckeditor5" | "ckeditor4" | "tinymce" | "quill";

const RichTextEditor: React.FC<RichTextEditorProps> = ({ label = "Content", name, value, error, onChange }) => {
  return (
    <div className="w-full">
      <style jsx global>{`
        .ck-editor__editable {
          height: 300px !important;
        }
      `}</style>
      <p>{label}</p>
      {error && <p>{error}</p>}

      {DEFAULT_EDITOR === "tinymce" && (
        <TinyMCEEditor
          apiKey="j351fapr77gabh0a6m4jirkdoog77h2hafpxext02zwk590q"
          value={value || ""}
          init={{
            height: 400,
            menubar: true,
            plugins:
              "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount",
            toolbar:
              "undo redo | formatselect | bold italic blockquote | alignleft aligncenter alignright alignjustify | " +
              "bullist numlist outdent indent | link image media table | " +
              "removeformat | help",
            content_style: `
              body {
                font-size:14px; 
                color: #171717;
              }`
          }}
          onEditorChange={(content) => onChange(name, content)}
        />
      )}

      {DEFAULT_EDITOR === "ckeditor5" && (
        <CKEditor
          editor={ClassicEditor as any}
          data={value || ""}
          onChange={(_: any, editor: { getData: () => any; }) => {
            const data = editor.getData();
            onChange(name, data);
          }}
          config={{
            toolbar: [
              "heading", "|", "bold", "italic", "blockQuote", "link",
              "numberedList", "bulletedList", "insertTable", "mediaEmbed",
              "undo", "redo"
            ],
          }}
        />
      )}

      {DEFAULT_EDITOR === "ckeditor4" && (
        <></>
        // <CKEditor
        //   initData={value || ""}
        //   config={{
        //     height: 400,
        //     extraPlugins: "image2,sourcearea",
        //     toolbar: [
        //       { name: "clipboard", items: ["Undo", "Redo"] },
        //       { name: "styles", items: ["Format"] },
        //       { name: "basicstyles", items: ["Bold", "Italic", "Blockquote"] },
        //       { name: "paragraph", items: ["NumberedList", "BulletedList"] },
        //       { name: "insert", items: ["Image", "Table", "MediaEmbed"] },
        //       { name: "links", items: ["Link", "Unlink"] },
        //       { name: "document", items: ["Source"] },
        //     ],
        //   }}
        //   onChange={(evt: any) => {
        //     onChange(name, evt.editor.getData());
        //   }}
        // />
      )}




    </div>
  );
};

export default RichTextEditor;
