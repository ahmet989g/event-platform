import Link from "next/link";

const Navbar = () => {

  return (
    <div className="flex items-center gap-10">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-primary">
        EventPlatform
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        <Link
          href="/tiyatro"
          prefetch={true}
          className="hover:text-primary"
        >
          Tiyatro
        </Link>
        <Link
          href="/spor"
          prefetch={true}
          className="hover:text-primary"
        >
          Spor
        </Link>
        <Link
          href="/konser"
          prefetch={true}
          className="hover:text-primary"
        >
          Konser
        </Link>
      </nav>
    </div>
  )
}

export default Navbar