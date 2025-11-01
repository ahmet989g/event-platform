import { AuthButton } from "./AuthButton";
import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto flex h-16 items-center justify-between !px-0">
        <Navbar />

        {/* Auth Buttons */}
        <AuthButton />
      </div>
    </header>
  );
}