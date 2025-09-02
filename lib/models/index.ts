import Blog from "./blog/Blog";
import Author from "./blog/Author";
import Blogmeta from "./blog/Blogmeta";
import BlogBlogmeta from "./blog/BlogBlogmeta";

import CommentModel from "./basic/CommentModel";
import Faq from "./basic/Faq";
import Testimonial from "./basic/Testimonial";
import Media from "./basic/Media";
import Page from "./basic/Page";
import PageDetail from "./basic/PageDetail";

import User from "./spatie/User";
import Otp from "./spatie/Otp";
import MenuSubmenu from "./spatie/MenuSubmenu";
import RolePermission from "./spatie/RolePermission";
import SpatieMenu from "./spatie/SpatieMenu";
import SpatiePermission from "./spatie/SpatiePermission";
import SpatieRole from "./spatie/SpatieRole";
import SpatieSubmenu from "./spatie/SpatieSubmenu";
import UserPermission from "./spatie/UserPermission";
import UserRole from "./spatie/UserRole";

import BankDetail from "./product/BankDetail";
import Commission from "./product/Commission";
import Documentation from "./product/Documentation";
import Ingridient from "./product/Ingridient";
import Product from "./product/Product";
import ProductBrand from "./product/ProductBrand";
import ProductFeature from "./product/ProductFeature";
import ProductIngridient from "./product/ProductIngridient";
import Productmeta from "./product/Productmeta";
import ProductSpecification from "./product/ProductSpecification";
import ProductProductBrand from "./product/ProductProductBrand";
import ProductProductFeature from "./product/ProductProductFeature";
import ProductProductmeta from "./product/ProductProductmeta";
import ProductProductSpecification from "./product/ProductProductSpecification";
import { Sku, SkuDetail } from "./product/Sku";
import SkuProductFeature from "./product/SkuProductFeature";
import Vendor from "./product/Vendor";

export default{
  Blog, Author, Blogmeta, BlogBlogmeta,
  CommentModel, Faq, Testimonial, Media, Page, PageDetail,
  User, Otp, SpatieRole, SpatiePermission, RolePermission, UserRole, UserPermission, SpatieMenu, SpatieSubmenu, MenuSubmenu,
  BankDetail, Commission, Documentation, Ingridient, Product, ProductBrand, ProductFeature, ProductIngridient, Productmeta, ProductSpecification, ProductProductBrand, ProductProductFeature, ProductProductmeta, ProductProductSpecification, Sku, SkuDetail, SkuProductFeature, Vendor, 
};

if (process.env.NODE_ENV !== "production") {
  (global as any).mongooseModels = {
    Blog, Author, Blogmeta, BlogBlogmeta,
    CommentModel, Faq, Testimonial, Media, Page, PageDetail,
    User, Otp, SpatieRole, SpatiePermission, RolePermission, UserRole, UserPermission, SpatieMenu, SpatieSubmenu, MenuSubmenu,
    BankDetail, Commission, Documentation, Ingridient, Product, ProductBrand, ProductFeature, ProductIngridient, Productmeta, ProductSpecification, ProductProductBrand, ProductProductFeature, ProductProductmeta, ProductProductSpecification, Sku, SkuDetail, SkuProductFeature, Vendor, 
  };
}