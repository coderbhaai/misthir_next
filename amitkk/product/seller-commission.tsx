"use client"

import { useState, useEffect, useCallback } from "react";
import router from "next/router";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { Button } from "@amitkk/components/button/button";
import { TextField } from "@amitkk/components/basic/TextField";

interface AdminCommissionProps {
    seller_id: string;
}

interface CommissionEntry {
    _id?: string | null;
    module: string;
    module_id: string;
    name: string;
    percentage: number | "";
}

export default function AdminSellerCommission({ seller_id }: AdminCommissionProps) {
    const [commissions, setCommissions] = useState<CommissionEntry[]>([]);
    const [title, setTitle] = useState<string>("All Commissions");
    const [seller, setSeller] = useState<any>(null);

    const fetchData = useCallback(async () => {
        try {
            const resModules = await apiRequest("POST", `ecom/commission`, {
                function: "get_all_commission_modules",
                seller_id            
            });
            
            const rawData: Array<{
                _id?: string | null;
                module: string;
                module_id: string;
                name: string;
                percentage: number | null;
            }> = resModules?.data ?? [];

            const formattedCommissions: CommissionEntry[] = rawData.map((item) => ({
                _id: item._id,
                module: item.module,
                module_id: item.module_id,
                name: item.name,
                percentage: item.percentage !== null && item.percentage !== undefined ? Number(item.percentage) : "",
            }));

            setCommissions(formattedCommissions);
            const resSeller = await apiRequest("GET", `basic/spatie?function=get_single_user&id=${encodeURIComponent(seller_id)}`);
            setSeller(resSeller?.data);

            if (resSeller?.data) {
                setTitle(`Commission For ${resSeller.data.name}`);
            } else {
                router.push('/404');
            }
        } catch (error) { clo(error); }
    }, [seller_id]);

    useEffect(() => {
        if (seller_id && seller_id.trim().length > 0) {
            fetchData();
        }
    }, [seller_id, fetchData]);

    const handlePercentageChange = (module_id: string, value: string) => {
        setCommissions((prev) =>
            prev.map((entry) => 
                entry.module_id === module_id 
                    ? { ...entry, percentage: value === "" ? "" : Number(value) } 
                    : entry 
            )
        );
    };
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const payload = commissions.filter((p) => p.percentage !== "").map((p) => ({
                module: p.module,
                module_id: p.module_id,
                user_id: seller_id,
                percentage: p.percentage,
                ...(p._id ? { _id: p._id } : {})
            }));

        await apiRequest("POST", `ecom/commission`, {
            function: "create_update_seller_commission",
            data: payload,
            user_id: seller_id
        });
    };
    
    return (       
       <>
            <h4 className="mb-4">{title}</h4>
            
            <form onSubmit={handleSubmit}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-3">Module Type</th>
                                <th className="p-3">Name</th>
                                <th className="p-3 w-1/3">Commission Percentage (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissions.length > 0 ? (
                                commissions.map((item) => (
                                    <tr className="border-b hover:bg-gray-50" key={`${item.module}-${item.module_id}`}>
                                        <td className="p-3">
                                            <span className="px-2 py-1 text-xs font-semibold bg-gray-100 rounded text-gray-700">
                                                {item.module}
                                            </span>
                                        </td>
                                        <td className="p-3 font-medium">{item.name}</td>
                                        <td className="p-3">
                                            <TextField 
                                                type="number" 
                                                placeholder="Enter percentage" 
                                                value={item.percentage} 
                                                onChange={(e) => handlePercentageChange(item.module_id, e.target.value)} 
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center p-4 text-gray-500">
                                        No modules found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <Button type="submit">Save All Commissions</Button>
                </div>
            </form>
       </>
    );
}