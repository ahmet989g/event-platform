"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const router = useRouter();

  useEffect(() => {
    // Giriş başarılı olduğunda ana sayfaya yönlendir
    if (state?.success) {
      // UserContext'e haber ver
      window.dispatchEvent(new Event("auth-state-change"));
      router.push("/");
      router.refresh(); // Server component'leri yenile
    }
  }, [state?.success, router]);

  return (
    <>
      <h2 className="mb-6 text-center text-2xl font-bold">Giriş Yap</h2>

      {state?.message && !state.success && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Şifre
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {state?.errors?.password && (
            <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
          )}
        </div>

        <div className="text-right">
          <Link
            href="/sifremi-unuttum"
            className="text-sm text-primary hover:text-secondary"
          >
            Şifremi unuttum
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Hesabın yok mu?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:text-secondary"
        >
          Kayıt Ol
        </Link>
      </p>
    </>
  )
}

export default LoginForm