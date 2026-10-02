"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { Button } from "@amitkk/components/button/button";
import { TextField } from '@amitkk/components/basic/TextField';
import { AdminModuleProps } from "@amitkk/basic/types";
import ModuleSelector from "@amitkk/components/admin/ModuleSelector";
import StatusDisplay from "@amitkk/components/admin/status-display-input";

const RichTextEditor = dynamic(() => import("@amitkk/components/admin/ckeditor-input"), {  
    ssr: false, loading: () => <p>Loading editor...</p>,
});

interface DataProps {
    module: string;
    module_id: string;
}

type MenuBlock = {
    _id?: string;
    menu: string;
    content: string;
    status: boolean;
    displayOrder?: number | null;
};

export default function TabBlockForm({ module = "", module_id = "" }: AdminModuleProps) {
    const [formData, setFormData] = React.useState<DataProps>({
        module,
        module_id,
    });
    const handleModuleChange = (name: string, value: string) => {
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "module") { updated.module_id = ""; }
            return updated;
        });
    };

    const router = useRouter();

    const [blocks, setBlocks] = useState<MenuBlock[]>([
        { _id: '', menu: "", content: "", status: true, displayOrder: null }
    ]);

    useEffect(() => {
        if (module && module_id) {
            const fetchSingleEntry = async () => {
                try {
                    const res = await apiRequest("POST", "block/genericBlock", { 
                        function: "get_single_tab_block",
                        module, module_id
                    });
                    
                    if (res?.data && Array.isArray(res.data)) {
                        setBlocks(
                            res.data.map((b: any) => ({
                                _id: b._id,
                                menu: b.menu,
                                content: b.content ?? "",
                                status: b.status ?? true,
                                displayOrder: b.displayOrder ?? null
                            }))
                        );
                    }
                } catch (error) { clo(error); }
            };
            fetchSingleEntry();
        }
    }, [module, module_id]);

    const addMenuBlock = () => { setBlocks((prev) => [...prev, { menu: "", content: "", status: true, displayOrder: null }]); };
    const removeMenuBlock = (index: number) => { setBlocks((prev) => prev.filter((_, i) => i !== index)); };
    const updateBlock = (index: number, key: keyof MenuBlock, value: any) => {
        setBlocks(prev => prev.map((b, i) => (i === index ? { ...b, [key]: value } : b)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const invalid = blocks.some((b) => !b.menu.trim() || !b.content.trim());
        if (invalid) { hitToastr("error", "All menu items require a title and content"); return; }

        try {
            const reqData = {
                function: "create_update_tab_block",
                module: formData.module,
                module_id: formData.module_id,
                blocks,
            };

            const res = await apiRequest("POST", "block/genericBlock", reqData);
            
            hitToastr('success', res?.message);
            if (!module && !module_id && res?.data) { router.replace('/admin/tab-block'); }
        } catch (err) { clo(err); }
    };

    const title = !module ? 'Add Tab Block' : 'Update Tab Block';
    
    return (
        <>
            <div className="py-3">
                <h1 className="text-xl font-bold">{title}</h1>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "10px" }}>
                <ModuleSelector formData={formData} onFieldChange={handleModuleChange} className="grid grid-cols-1 gap-5 lg:grid-cols-2"/>

                {blocks.map((block, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full border rounded-xl p-4 my-4 bg-white">
                        <div className="md:col-span-2">
                            <h4 className="text-lg font-semibold text-gray-800">Block {index + 1}</h4>
                        </div>
                        <div className="md:col-span-1 flex justify-start md:justify-end items-center">
                            <img src="/images/icons/static/delete.svg" onClick={() => removeMenuBlock(index)} className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" alt="Delete block"/>
                        </div>
                        
                        {/* ⚡ Menu Name TextField Input */}
                        <div className="md:col-span-1">
                            <TextField 
                                label="Menu Name" 
                                value={block.menu} 
                                name={`menu_${index}`}
                                onChange={(e) => updateBlock(index, "menu", e.target.value)} 
                                required
                            />
                        </div>

                        {/* ⚡ Modular Status & Display Order Combined Section */}
                        <div className="md:col-span-2 self-end">
                            <StatusDisplay 
                                statusValue={block.status}
                                displayOrderValue={block.displayOrder ?? null}
                                onStatusChange={(val: boolean) => updateBlock(index, "status", val)}
                                onDisplayOrderChange={(val: number | null) => updateBlock(index, "displayOrder", val)}
                            />
                        </div>

                        <div className="md:col-span-3 mt-2">
                            <RichTextEditor label="Tab Content" name="content" value={block.content} onChange={(_, val) => updateBlock(index, "content", val)} required error=""/>
                        </div>
                    </div>
                ))}
                
                <div className="my-5 flex items-center gap-4">
                    <Button type="button" color="primary" onClick={addMenuBlock}>Add Block</Button>
                    <Button type="submit" color="primary">{title}</Button>
                </div>
            </form>
            <a href="/admin/tab-block" className="text-sm font-medium text-blue-600 hover:underline">Back to All Blocks</a>
        </>
    );
}