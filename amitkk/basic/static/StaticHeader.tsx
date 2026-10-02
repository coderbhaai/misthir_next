// static/StaticHeader.tsx

export default function StaticHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">

        <a href="/" className="flex items-center">
          <img src="/images/logo.svg" alt="AMITKK" width={70} height={40} decoding="async"/>
        </a>

        <nav className="hidden md:flex gap-6 text-sm font-semibold uppercase">
          <a href="/india">India</a>
          <a href="/blogs">Blogs</a>
          <a href="/contact-us">Contact</a>
        </nav>
      </div>
    </header>
  );
}