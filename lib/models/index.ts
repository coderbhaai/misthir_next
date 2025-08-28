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

export default{
  Blog, Author, Blogmeta, BlogBlogmeta,
  CommentModel, Faq, Testimonial, Media, Page, PageDetail,
  User, Otp, SpatieRole, SpatiePermission, RolePermission, UserRole, UserPermission, SpatieMenu, SpatieSubmenu, MenuSubmenu
};

if (process.env.NODE_ENV !== "production") {
  (global as any).mongooseModels = {
    Blog, Author, Blogmeta, BlogBlogmeta,
    CommentModel, Faq, Testimonial, Media, Page, PageDetail,
    User, Otp, SpatieRole, SpatiePermission, RolePermission, UserRole, UserPermission, SpatieMenu, SpatieSubmenu, MenuSubmenu
  };
}