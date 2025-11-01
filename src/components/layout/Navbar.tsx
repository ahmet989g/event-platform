import Link from "next/link";

const Navbar = () => {

  return (
    <div className="flex items-center gap-10">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-primary-600">
        EventPlatform
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        <Link
          href="/tiyatro"
          prefetch={true}
          className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
        >
          Tiyatro
        </Link>
        <Link
          href="/spor"
          prefetch={true}
          className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
        >
          Spor
        </Link>
        <Link
          href="/konser"
          prefetch={true}
          className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
        >
          Konser
        </Link>
      </nav>
    </div>
  )
}

export default Navbar