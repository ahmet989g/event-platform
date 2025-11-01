"use client";
import { updatePasswordAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import React, { useActionState, useEffect } from 'react'
import { toast } from 'sonner';

const UpdatePassword = () => {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, null);
  const router = useRouter();

  useEffect(() => {
    // İşlem başarılı olduğunda ana sayfaya yönlendir
    if (state?.success) {
      toast.success("Şifreniz başarıyla güncellendi!");
      router.push("/");
      router.refresh(); // Server component'leri yenile
    }
  }, [state?.success, router]);

  return (
    <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-center text-2xl font-bold">Şifrenizi Sıfırlayın</h2>
      <p className="mb-6">Lütfen aşağıya yeni şifrenizi girin.</p>

      {state?.message && !state.success && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="new_password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Yeni Şifre
          </label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            required
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {state?.errors?.password && (
            <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirm_new_password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Yeni Şifre Tekrar
          </label>
          <input
            type="password"
            id="confirm_new_password"
            name="confirm_new_password"
            required
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {state?.errors?.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{state.errors.confirmPassword[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Şifremi Yenile"}
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;