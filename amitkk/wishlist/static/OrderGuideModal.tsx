// components/OrderGuideModal.tsx
import { useState } from "react";
import { useAuth } from "contexts/AuthContext";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@amitkk/components/ui/tabs";
import { TextField } from "@amitkk/components/basic/TextField";
import { apiRequest, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";

interface OrderGuideModalProps {
  open: boolean;
  selectedDataId?: string | null;
  handleUpdate?: (payload?: any) => Promise<any>;
  onSelectGuide?: ((guideId: string) => void) | null;
  handleClose: () => void; 
}

export default function OrderGuideModal({ open, handleClose, onSelectGuide = null, handleUpdate }: OrderGuideModalProps) {
    const [activeTab, setActiveTab] = useState<string>("create");
    const handleTabChange = (value: string) => { setActiveTab(value); };

    const { orderGuides, loadingGuides } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [newGuideName, setNewGuideName] = useState("");

    if (!open) return null;

    const handleCreate = async () => {
        if (!newGuideName.trim()) return;

        const formDataToSend = new FormData();
        formDataToSend.append("function", "create_update_order_guide");
        formDataToSend.append("name", newGuideName);
        const res = await apiRequest("POST", `ecom/wishlist`, formDataToSend);

        if (res?.data) {
            onSelectGuide?.(res?.data?._id);
            if (handleUpdate) await handleUpdate();

            hitToastr('success', res?.message);
            setNewGuideName("");
            setIsCreating(false);
            handleClose();
        }
    };

    const title = "Create / Select Order GuideAddress";

    return (
        <CustomModal open={open} handleClose={handleClose} title={title} width={"30"}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col">        
                <TabsList className="w-full block bg-transparent h-auto p-0 justify-start space-x-2 rounded-none border-b-0 mb-6">            
                <TabsTrigger value="create" className="data-[state=active]:border-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 py-2">Create Order Guide</TabsTrigger>
                {orderGuides?.length > 0 && (
                    <TabsTrigger value="select" className="data-[state=active]:border-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 py-2">Select Order Guide</TabsTrigger>
                )}
                </TabsList>
            
            <TabsContent value="create">
                <div className="space-y-4">
                    <TextField label='Guide Name' value={newGuideName} name='name' onChange={(e) => setNewGuideName(e.target.value)} required/>
                    <div className="flex gap-2">
                        <button onClick={handleCreate} className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90">Save & Select</button>
                        <button onClick={() => setIsCreating(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancel</button>
                    </div>
                </div>
                
            </TabsContent>
            <TabsContent value="select">
                {orderGuides?.map((guide: any) => (
                    <button key={guide._id} onClick={() => { onSelectGuide?.(guide._id); handleClose(); }} className="w-full rounded-lg border border-gray-200 p-3 text-left text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5">{guide.name || "Untitled Guide"}</button>
                ))}                
            </TabsContent>
            </Tabs>
        </CustomModal>        
    );
}