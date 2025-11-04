"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";

const RegisterForm = () => {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const router = useRouter();

  // Başarılı kayıt sonrası toast ve redirect
  useEffect(() => {
    if (state?.success) {
      toast.success("Kayıt başarılı! Giriş Yapıldı!");

      // UserContext'e haber ver
      window.dispatchEvent(new Event("auth-state-change"));

      // Navigation
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    }
  }, [state?.success, router]);

  return (
    <>
      <h2 className="mb-6 text-center text-2xl font-bold">Kayıt Ol</h2>

      {/* Genel Hata Mesajı */}
      {state?.message && !state.success && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* İsim Soyisim */}
        <div>
          <label htmlFor="first_name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Ad</label>
          <input type="text" id="first_name" name="first_name" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          {state?.errors?.first_name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.first_name[0]}</p>
          )}
        </div>

        {/* Soyad */}
        <div>
          <label
            htmlFor="last_name"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Soyad
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {state?.errors?.last_name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.last_name[0]}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Şifre */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Şifre <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {state?.errors?.password && (
            <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
          )}
        </div>

        {/* Şifre Tekrar */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Şifre Tekrar <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {state?.errors?.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Kayıt yapılıyor..." : "Kayıt Ol"}
        </button>
      </form>
    </>
  )
}

export default RegisterForm