export type MainCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
}

export type SubCategory = MainCategory & {
  order?: number | null;
}