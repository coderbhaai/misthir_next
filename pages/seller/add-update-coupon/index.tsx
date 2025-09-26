import SellerCouponForm from '@amitkk/seller/admin/add-update-seller-coupon-form';
import { useVendorId } from 'hooks/useVendorId';

const AddSellerCoupon = () => {
  const vendor_id = useVendorId();
  
  return <SellerCouponForm dataId='' vendor_id ={vendor_id as string} coupon_by="Vendor"/>;
};

export default AddSellerCoupon;