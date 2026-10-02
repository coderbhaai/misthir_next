"use client";

import Link from "next/link";
import CopyRight from "./CopyRight";
import SocialMedia from "./SocialMedia";
import { useMenu } from "contexts/MenuContext";
import { ArrowUpRight, Mail, Phone, MapPin, Briefcase, ArrowRight, } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CartSidebar from "@amitkk/ecom/static/CartSidebar";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const { menus, extraMenus, loading } = useMenu();
  const techMenu = menus.find((menu) => menu.originalUrl === "our-technology");
  const servicesMenu = menus.find((menu) => menu.originalUrl === "our-services");
  const portfolioMenu = menus.find((menu) => menu.originalUrl === "our-portfolio");
  const serviceItems = servicesMenu?.dropdown?.kind === "grouped" ? servicesMenu.dropdown.groups.flatMap((group) => group.items) : [];
  const techItems = techMenu?.dropdown?.kind === "flat" ? techMenu.dropdown.items : [];
  const portfolioItems = portfolioMenu?.dropdown?.kind === "flat" ? portfolioMenu.dropdown.items : [];

const quickLinks = extraMenus.map((item) => ({
  name: item.label,
  url: item.to,
}));

  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = footerRef.current;

    if (!el) return;

    gsap.fromTo(
      el.querySelectorAll(".footer-animate"),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  return (
    <footer ref={footerRef} className="relative overflow-hidden bg-slate-950 text-slate-200 pt-16 pb-6">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none"/>
      <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"/>
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="footer-animate grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800/80 items-center">
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <img src="/images/logo.svg" alt="AMITKKAE" className="h-12 w-auto brightness-200 drop-shadow-[0_0_12px_rgba(45,212,191,0.3)] transition-transform hover:scale-105"/>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">Empowering digital experiences with high-performance engineering, scalable cloud solutions, and intuitive UI/UX design.</p>
            <div className="pt-2"><SocialMedia/></div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="mailto:amit@amitkk.com" className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/50 hover:bg-slate-900 transition-all group">
              <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                <Mail className="h-5 w-5" />
              </div>

              <div className="overflow-hidden">
                <p className="text-xs text-slate-400 font-medium">Email Us</p>
                <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-teal-400 transition-colors">amit@amitkk.com</p>
              </div>
            </a>

            <a href="tel:+911234567890" className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/50 hover:bg-slate-900 transition-all group">
              <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                <Phone className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">Call Us</p>
                <p className="text-xs font-semibold text-slate-200 group-hover:text-teal-400 transition-colors">+91 123 456 7890</p>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400">
                <MapPin className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">Location</p>
                <p className="text-xs font-semibold text-slate-200">India</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-animate my-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 border border-teal-500/20 relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="space-y-1 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5" />
                Featured Work
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Explore Our Recent Engineering & Digital Projects</h3>
            </div>

            <Link href={portfolioMenu?.to || "/portfolio"} className="z-10 shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]">
              <span>View All Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="z-10 relative">
            <p className="text-xs font-medium text-slate-400 mb-3">Browse Portfolio Categories:</p>

            {loading ? (
              <p className="text-xs text-slate-500">Loading portfolio projects...</p>
            ) : portfolioItems.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {portfolioItems.map((item, index) => (
                  <Link key={`${item.label}-footer-${index}`} href={item.to} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-teal-500/20 border border-slate-700/60 hover:border-teal-500/50 text-slate-300 hover:text-teal-300 transition-all text-xs font-medium group">
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No portfolio items available.</p>
            )}
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
        </div>

        <div className="footer-animate row py-10 border-b border-slate-800/80">
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">Our Services</h3>

            {loading ? (
              <p className="text-xs text-slate-500">Loading services...</p>
            ) : serviceItems.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {serviceItems.map((item, index) => (
                  <li key={`${item.label}-services-footer-${index}`}>
                    <Link href={item.to} className="text-slate-400 hover:text-slate-100 hover:translate-x-1 transition-all inline-flex items-center gap-1 group text-xs sm:text-sm">
                      <span className="truncate">{item.label}</span>
                      <ArrowUpRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No services found</p>
            )}
          </div>

          <div className="md:col-span-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">Technologies</h3>

            {loading ? (
              <p className="text-xs text-slate-500">Loading technologies...</p>
            ) : techItems.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {techItems.map((item, index) => (
                  <li key={`${item.label}-footer-${index}`}>
                    <Link href={item.to} className="text-slate-400 hover:text-slate-100 hover:translate-x-1 transition-all inline-flex items-center gap-1 group text-xs sm:text-sm">
                      <span className="truncate">{item.label}</span>
                      <ArrowUpRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No technologies found</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((item, index) => (
                <li key={`${item.name}-footer-${index}`}>
                  <Link href={item.url} className="text-slate-400 hover:text-slate-100 hover:translate-x-1 transition-all inline-block text-xs sm:text-sm">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="footer-animate"><CopyRight /></div>
        <CartSidebar/>
      </div>
    </footer>
  );
};

export default Footer;