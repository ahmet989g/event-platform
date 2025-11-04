"use client";
import { resetPasswordAction } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useActionState, useEffect } from 'react'

const ForgotPassword = () => {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);
  const router = useRouter();

  useEffect(() => {
    // İşlem başarılı olduğunda ana sayfaya yönlendir
    if (state?.success) {
      //router.push("/");
      router.refresh(); // Server component'leri yenile
    }
  }, [state?.success, router]);

  if (state?.success) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
        <h2 className="mb-6 text-center text-2xl font-bold">Şifre Sıfırlama E-postası Gönderildi</h2>
        <p className="mb-6">Şifre sıfırlama talimatları içeren bir e-posta gönderdik. Lütfen e-postanızı kontrol edin.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-center text-2xl font-bold">Şifrenizi Sıfırlayın</h2>
      <p className="mb-6">E-postanızı yazın, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.</p>

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

        <button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Giriş yapılıyor..." : "Sıfırlama E-postası Gönder"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Şifreni hatırladın mı?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-secondary"
        >
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}

export default ForgotPassword