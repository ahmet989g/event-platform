export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
}