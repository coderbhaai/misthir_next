"use client";

import { useEffect, useState } from "react";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { OrderProps } from '@amitkk/ecom/types';
import { fullAddress, getMaskedAddress } from "@amitkk/address/utils/addressUtils";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import SuggestProducts from "@amitkk/product/static/suggest-products";
import { generateInvoice } from "@amitkk/payment/utils/utils";
import { Button } from "@amitkk/components/button/button";
import { AddressProps } from "@amitkk/address/types";
import OrderList from "@amitkk/ecom/static/OrderList";
import { useAuth } from "contexts/AuthContext";

interface DataFormProps {
    order_id?: string;
} 

export const UserSingleOrder: React.FC<DataFormProps> = ({ order_id }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<OrderProps | null>(null);
  const [blogs, setBlogs] = useState([]);
  const [products, setProducts] = useState([]);
  
  const { user } = useAuth();
  const currentUserId = user?._id;

  const fetchSingleEntry = async () => {
    if (!order_id) return;
    setLoading(true);

    try {
      const res = await apiRequest("POST", `ecom/ecom`,{ 
        function: "get_single_order",
        order_id
      });

      console.log("RES", order_id, res);
      
      if (res?.data) {
        const orderData = res.data as OrderProps;
        setData(orderData);
        setBlogs(res?.relatedContent?.blogs);
        setProducts(res?.relatedContent?.products);
      }
    } catch (error) { clo(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSingleEntry(); }, [order_id]);

  if (loading) { return <div>Loading order details...</div>; }
  if (!data) { return null; }

  const isOwner = currentUserId && data?.user_id === currentUserId;

  const formatAddress = (address: AddressProps | string) => {
    if (isOwner) {
      return fullAddress(address as AddressProps);
    } else {
      return getMaskedAddress(address as AddressProps);
    }
  };

  console.log("isOwner", isOwner)

  return (
    <>
      <div className="container py-5 md:py-12">
        <div className="row">
          <div className="col-span-12 md:col-span-8">
            <h1 className="text-lg font-bold mb-3 text-foreground">My Order</h1>            
            {data?.shipping_address_id && ( <p className="mb-3"><span style={{ fontWeight: 700 }}>Shipping Address: </span>{formatAddress(data.shipping_address_id)}</p> )}
            {data?.billing_address_id && ( <p className="mb-3"><span style={{ fontWeight: 700 }}>Billing Address: </span>{formatAddress(data.billing_address_id)}</p> )}
            {isOwner && data?.user_remarks && ( <p className="mb-3"><span style={{ fontWeight: 700 }}>Order Note: </span>{data?.user_remarks}</p> )}
            <p className="mb-3"><strong>Payment Method:</strong> {data.paymode}</p>
            
            {isOwner && ( <Button onClick={() => { if (data) generateInvoice(data); }}>Download Invoice</Button> )}
          </div>

          <OrderList order={data}/>
        </div>
      </div>
      <SuggestProducts data={products} />
      <SuggestBlogs data={blogs} />
    </>
  );
};

export default UserSingleOrder;