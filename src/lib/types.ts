export type SourceType = 'manual' | 'url' | 'photo'
export type ContentType = 'structured' | 'freeform' | 'photo_only'
export type ImageType = 'source_photo' | 'dish_photo' | 'illustration'
export type RecipeStatus = 'want_to_try' | 'made_it'
export type RecipeCategory =
  | 'breakfast' | 'starter' | 'main' | 'side'
  | 'soup_stew' | 'salad' | 'dessert' | 'baking'
  | 'snack' | 'drink' | 'sauce_dip'

export interface Profile {
  id: string
  email: string
  display_name: string
  accent_colour: string
  avatar_url: string | null
  created_at: string
}

export interface Ingredient {
  amount: string
  unit: string
  item: string
}

export interface Recipe {
  id: string
  title: string
  description: string | null
  source_url: string | null
  source_type: SourceType
  content_type: ContentType
  ingredients: Ingredient[] | null
  steps: string[] | null
  freeform_text: string | null
  ocr_text: string | null
  servings: string | null
  categories: RecipeCategory[]
  added_by: string
  created_at: string
  updated_at: string
}

export interface RecipeWithProfile extends Recipe {
  profiles: Profile
}

export interface RecipeImage {
  id: string
  recipe_id: string
  image_url: string
  image_type: ImageType
  caption: string | null
  uploaded_by: string
  sort_order: number
  created_at: string
}

export interface Tag {
  id: string
  name: string
}

export interface RecipeTag {
  recipe_id: string
  tag_id: string
}

export interface UserRecipeStatus {
  recipe_id: string
  user_id: string
  status: RecipeStatus | null
}

export interface CookLog {
  id: string
  recipe_id: string
  cooked_by: string
  cooked_on: string
  note: string | null
  photo_url: string | null
  created_at: string
}

export interface CookLogReaction {
  id: string
  cook_log_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface Comment {
  id: string
  recipe_id: string
  author_id: string
  body: string
  created_at: string
}
