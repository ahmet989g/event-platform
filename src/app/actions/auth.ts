"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface AuthState {
  success: boolean;
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
    first_name?: string[];
    last_name?: string[];
    confirmPassword?: string[];
  };
}

// REGISTER ACTION
export async function registerAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;

  // Validation
  const errors: AuthState["errors"] = {};

  if (!email || !email.includes("@")) {
    errors.email = ["Geçerli bir email adresi giriniz"];
  }

  if (!password || password.length < 6) {
    errors.password = ["Şifre en az 6 karakter olmalıdır"];
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = ["Şifreler eşleşmiyor"];
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const supabase = await createClient();

    // 1. Kayıt yap
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: first_name || null,
          last_name: last_name || null,
        },
      },
    });

    if (signUpError) {
      return {
        success: false,
        message: signUpError.message,
      };
    }

    // 2. Email confirmation kapalıysa otomatik session oluşur
    // Ama yine de kontrol edelim
    if (!signUpData.session) {
      // Session yoksa manuel login yap
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Auto sign-in error:", signInError);
        // Login başarısız ama kayıt başarılı
        return {
          success: true,
          message: "Kayıt başarılı! Lütfen giriş yapın.",
        };
      }
    }

    // 3. Profile güncelle
    if (signUpData.user && (first_name || last_name)) {
      await supabase
        .from("profiles")
        .update({
          first_name: first_name || null,
          last_name: last_name || null,
        })
        .eq("id", signUpData.user.id);
    }

    // Cache'i temizle
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message: "Kayıt sırasında bir hata oluştu",
    };
  }
}

// LOGIN ACTION
export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validation
  const errors: AuthState["errors"] = {};

  if (!email || !email.includes("@")) {
    errors.email = ["Geçerli bir email adresi giriniz"];
  }

  if (!password) {
    errors.password = ["Şifre alanı zorunludur"];
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: "Email veya şifre hatalı",
      };
    }

    // Cache'i temizle (önemli!)
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Giriş sırasında bir hata oluştu",
    };
  }
}

// RESET PASSWORD ACTION
export async function resetPasswordAction(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;

  // Validation
  const errors: AuthState["errors"] = {};

  if (!email || !email.includes("@")) {
    errors.email = ["Geçerli bir email adresi giriniz"];
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/sifremi-yenile` // Şifre sıfırlama sonrası yönlendirilecek URL
      });

    if (error) {
      return {
        success: false,
        message: "Şifre sıfırlama isteği gönderilemedi",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: "Şifre sıfırlama sırasında bir hata oluştu",
    };
  }
}

// UPDATE PASSWORD ACTION
export async function updatePasswordAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const newPassword = formData.get("new_password") as string;
  const confirmNewPassword = formData.get("confirm_new_password") as string;

  // Validation
  const errors: AuthState["errors"] = {};

  if (!newPassword || newPassword.length < 6) {
    errors.password = ["Şifre en az 6 karakter olmalıdır"];
  }

  if (newPassword !== confirmNewPassword) {
    errors.confirmPassword = ["Şifreler eşleşmiyor"];
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Update password error:", error);
    return {
      success: false,
      message: "Şifre güncelleme sırasında bir hata oluştu",
    };
  }
}

// PROFILE UPDATE ACTION
export async function updateProfileAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        message: "Kullanıcı bulunamadı",
      };
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        first_name: first_name,
        last_name: last_name,
        email: email,
      },
    });

    if (authError) {
      console.error("Auth metadata update error:", authError);
      return {
        success: false,
        message: "Kullanıcı bilgileri güncellenemedi",
      };
    }

    // Profile güncelle
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: first_name,
        last_name: last_name,
        email: email,
      })
      .eq("id", user.id);
    if (error) throw error;

    // Cache'i temizle (önemli!)
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      message: "Profil güncelleme sırasında bir hata oluştu",
    };
  }
}

// LOGOUT ACTION
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}