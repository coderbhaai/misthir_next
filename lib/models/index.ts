import mongoose, { Model } from "mongoose";

import Blog from "./blog/Blog";
import Author from "./blog/Author";
import Blogmeta from "./blog/Blogmeta";
import BlogBlogmeta from "./blog/BlogBlogmeta";

import Client from "./basic/Client";
import CommentModel from "./basic/Comment";
import Contact from "./basic/Contact";
import Faq from "./basic/Faq";
import Media from "./basic/Media";
import MediaHub from "./basic/MediaHub";
import Meta from "./basic/Meta";
import Page from "./basic/Page";
import PageDetail from "./basic/PageDetail";
import { Search, SearchResult } from "./basic/Search";
import Testimonial from "./basic/Testimonial";
import UserBrowsingHistory from "./basic/UserBrowsingHistory";
import Review from "./basic/Review";

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

import Address from "./address/Address";
import City from "./address/City";
import Country from "./address/Country";
import State from "./address/State";

import { Cart, CartSku, CartCharges, CartCoupon } from "./ecom/Cart";
import { Order, OrderSku, OrderCharges, OrderCoupon } from "./ecom/Order";
import Sale from "./ecom/Sale";
import SaleSku from "./ecom/SaleSku";

import SiteSetting from "./payment/SiteSetting";
import Tax from "./payment/Tax";
import Razorpay from "./payment/Razorpay";
import TaxCollected from "./payment/TaxCollected";
import { auditLoggerPlugin } from "pages/lib/auditLogger";

const models: Record<string, any> = {
  // Refrences
  User, Media, MediaHub, Product,

  Review,
  // Blog
  Blog, Author, Blogmeta, BlogBlogmeta,

  // Address
  Address, City, Country, State,

  // Ecom
  ...Cart, ...CartSku, ...CartCharges, ...CartCoupon, ...Order, ...OrderSku, ...OrderCharges, ...OrderCoupon, Sale, SaleSku,

  // Basic
  Client, CommentModel, Contact, Faq, Meta, Page, PageDetail, ...Search, ...SearchResult, Testimonial, UserBrowsingHistory, 

  // Spatie
   Otp, SpatieRole, SpatiePermission, RolePermission, UserRole, UserPermission, SpatieMenu, SpatieSubmenu, MenuSubmenu,

  // Product
  BankDetail, Commission, Documentation, Ingridient,  ProductBrand, ProductFeature, ProductIngridient, Productmeta, ProductSpecification, ProductProductBrand, ProductProductFeature, ProductProductmeta, ProductProductSpecification, ...Sku, ...SkuDetail, SkuProductFeature, Vendor,

  // Payment
  SiteSetting, Tax, Razorpay, TaxCollected,
};

const modelsToAudit = [
  "Sale",
  "SaleSku",
  "Order",
  "OrderSku",
  "Product",
  "Vendor",
  "Faq"
];


if (process.env.MODE !== "production") {
  (global as any).mongooseModels = (global as any).mongooseModels || {};

  Object.entries(models).forEach(([name, model]) => {
    if (isModel(model)) {
      mongoose.models[name] = model;
      (global as any).mongooseModels[name] = model;

      if (modelsToAudit.includes(name)) {
        model.schema.plugin(auditLoggerPlugin);
      }
    } else {
      console.warn(`[WARNING] Skipping ${name} because it is not a Mongoose model`);
    }
  });
}

export function isModel(obj: any): obj is Model<any> {
  return obj && typeof obj.init === "function";
}

export default models;