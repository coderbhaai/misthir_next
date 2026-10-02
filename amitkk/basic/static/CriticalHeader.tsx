export default function CriticalHeader() {
  return (
    <header className="h-16 flex items-center justify-between border-b">
      <img src="/logo.svg" alt="logo" width={100} height={30} />

      {/* NO menu, NO context, NO API */}
      <nav>
        <a href="/india">India</a>
        <a href="/blogs">Blogs</a>
      </nav>
    </header>
  );
}