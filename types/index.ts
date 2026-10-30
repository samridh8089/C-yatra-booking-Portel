export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  portal_count?: number;
}

export interface Portal {
  id: string;
  category_id: string;
  name: string;
  website_url: string;
  logo_url?: string | null;
  description?: string | null;
  internal_notes?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'owner' | 'admin';
}
