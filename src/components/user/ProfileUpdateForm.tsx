"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { type User } from '@supabase/supabase-js'
import { updateProfileAction } from "@/app/actions/auth";

const ProfileUpdateForm = ({ user }: { user: User | null }) => {
  const { getProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.user_metadata.first_name || "",
    last_name: user?.user_metadata.last_name || "",
    email: user?.email || "",
  });


  useEffect(() => {
    getProfile(user?.id ? user.id : "")
  }, [user, getProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = new FormData();
      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("email", formData.email);

      const result = await updateProfileAction(null, data);

      if (result.success) {
        toast.success("Profil başarıyla güncellendi! ✅");
        setIsEditing(false);

        // UserContext'i güncelle
        window.dispatchEvent(new Event("auth-state-change"));
      } else {
        toast.error(result.message || "Profil güncellenirken bir hata oluştu");
      }
    } catch (error) {
      toast.error("Profil güncellenirken bir hata oluştu");
      console.error("Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.user_metadata.first_name || "",
      last_name: user?.user_metadata.last_name || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profil Bilgileri
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Hesap bilgilerinizi görüntüleyin ve güncelleyin
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Kişisel Bilgiler
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ad, soyad ve iletişim bilgileriniz
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Düzenle
            </button>
          )}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Ad */}
            <div>
              <label
                htmlFor="first_name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Ad
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/50"
              />
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
                value={formData.last_name || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/50"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-gray-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/50"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Kaydet
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Additional Info Card */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Bilgilerinizi Güncel Tutun
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Etkinlik güncellemeleri ve bilet bilgileri için doğru iletişim
              bilgilerinizi paylaşmanız önemlidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateForm;