export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          background_style: string | null
          banner_text: string
          banner_type: string | null
          created_at: string | null
          enabled: boolean | null
          end_date: string | null
          id: string
          link_url: string | null
          priority: number | null
          show_countdown: boolean | null
          start_date: string | null
          subtext: string | null
          text_alignment: string | null
        }
        Insert: {
          background_style?: string | null
          banner_text?: string
          banner_type?: string | null
          created_at?: string | null
          enabled?: boolean | null
          end_date?: string | null
          id?: string
          link_url?: string | null
          priority?: number | null
          show_countdown?: boolean | null
          start_date?: string | null
          subtext?: string | null
          text_alignment?: string | null
        }
        Update: {
          background_style?: string | null
          banner_text?: string
          banner_type?: string | null
          created_at?: string | null
          enabled?: boolean | null
          end_date?: string | null
          id?: string
          link_url?: string | null
          priority?: number | null
          show_countdown?: boolean | null
          start_date?: string | null
          subtext?: string | null
          text_alignment?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          size: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          size?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          offer_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          offer_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          offer_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_sales: {
        Row: {
          category: string | null
          created_at: string | null
          discount_percentage: number | null
          enabled: boolean | null
          end_date: string | null
          id: string
          scope: string | null
          stacking_enabled: boolean | null
          start_date: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          enabled?: boolean | null
          end_date?: string | null
          id?: string
          scope?: string | null
          stacking_enabled?: boolean | null
          start_date?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          enabled?: boolean | null
          end_date?: string | null
          id?: string
          scope?: string | null
          stacking_enabled?: boolean | null
          start_date?: string | null
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          button_text: string | null
          created_at: string | null
          display_type: string | null
          enabled: boolean | null
          id: string
          image_url: string | null
          link_url: string | null
          sort_order: number | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          button_text?: string | null
          created_at?: string | null
          display_type?: string | null
          enabled?: boolean | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          button_text?: string | null
          created_at?: string | null
          display_type?: string | null
          enabled?: boolean | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      new_arrivals: {
        Row: {
          added_at: string | null
          id: string
          product_title: string | null
          shopify_handle: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_title?: string | null
          shopify_handle: string
        }
        Update: {
          added_at?: string | null
          id?: string
          product_title?: string | null
          shopify_handle?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          checkout_url: string | null
          counter_price: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          offered_price: number
          product_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          checkout_url?: string | null
          counter_price?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          offered_price: number
          product_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          checkout_url?: string | null
          counter_price?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          offered_price?: number
          product_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          size: string | null
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity?: number
          size?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          shipping_address: Json | null
          status: string | null
          total: number
          tracking: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          shipping_address?: Json | null
          status?: string | null
          total: number
          tracking?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          shipping_address?: Json | null
          status?: string | null
          total?: number
          tracking?: string | null
          user_id?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          content: string
          id: string
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          id?: string
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          id?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          id?: string
          product_id: string
          sort_order?: number | null
          url: string
        }
        Update: {
          id?: string
          product_id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          quantity: number
          size: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity?: number
          size: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category: string
          color: string | null
          condition: string | null
          condition_description: string | null
          created_at: string | null
          description: string | null
          discount_enabled: boolean | null
          discount_end: string | null
          discount_start: string | null
          discount_type: string | null
          discount_value: number | null
          featured: boolean | null
          id: string
          is_flash_sale: boolean | null
          material: string | null
          measurements: Json | null
          name: string
          price: number
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          category?: string
          color?: string | null
          condition?: string | null
          condition_description?: string | null
          created_at?: string | null
          description?: string | null
          discount_enabled?: boolean | null
          discount_end?: string | null
          discount_start?: string | null
          discount_type?: string | null
          discount_value?: number | null
          featured?: boolean | null
          id?: string
          is_flash_sale?: boolean | null
          material?: string | null
          measurements?: Json | null
          name: string
          price: number
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          category?: string
          color?: string | null
          condition?: string | null
          condition_description?: string | null
          created_at?: string | null
          description?: string | null
          discount_enabled?: boolean | null
          discount_end?: string | null
          discount_start?: string | null
          discount_type?: string | null
          discount_value?: number | null
          featured?: boolean | null
          id?: string
          is_flash_sale?: boolean | null
          material?: string | null
          measurements?: Json | null
          name?: string
          price?: number
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          newsletter_subscribed: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          newsletter_subscribed?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          newsletter_subscribed?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      saved_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string | null
          postal_code: string
          state: string | null
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          postal_code: string
          state?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          postal_code?: string
          state?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          publish_date: string | null
          published: boolean | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          publish_date?: string | null
          published?: boolean | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          publish_date?: string | null
          published?: boolean | null
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
