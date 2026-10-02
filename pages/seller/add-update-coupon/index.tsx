import SellerCouponForm from '@amitkk/coupon/admin/add-update-coupon-form';
import { useVendorId } from 'hooks/useVendorId';

const AddSellerCoupon = () => {
  const seller_id = useVendorId();
  
  return <SellerCouponForm dataId='' seller_id ={seller_id as string} coupon_by="Vendor"/>;
};

export default AddSellerCoupon;