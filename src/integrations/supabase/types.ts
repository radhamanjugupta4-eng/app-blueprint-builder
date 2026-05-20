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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      abilities: {
        Row: {
          cooldown_seconds: number
          cost: number
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_premium: boolean
          name: string
          one_time_use: boolean
          slug: string
        }
        Insert: {
          cooldown_seconds?: number
          cost?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_premium?: boolean
          name: string
          one_time_use?: boolean
          slug: string
        }
        Update: {
          cooldown_seconds?: number
          cost?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_premium?: boolean
          name?: string
          one_time_use?: boolean
          slug?: string
        }
        Relationships: []
      }
      character_state: {
        Row: {
          affection: number
          character_id: string
          deaths: number
          fear: number
          id: string
          last_interaction: string | null
          relationship: number
          trust: number
          unlocked_secrets: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          affection?: number
          character_id: string
          deaths?: number
          fear?: number
          id?: string
          last_interaction?: string | null
          relationship?: number
          trust?: number
          unlocked_secrets?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          affection?: number
          character_id?: string
          deaths?: number
          fear?: number
          id?: string
          last_interaction?: string | null
          relationship?: number
          trust?: number
          unlocked_secrets?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_state_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          category: string | null
          chats_count: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_nsfw: boolean
          is_premium: boolean
          likes: number
          name: string
          slug: string
          sort_order: number
          tagline: string | null
          wallpaper_url: string | null
        }
        Insert: {
          category?: string | null
          chats_count?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_nsfw?: boolean
          is_premium?: boolean
          likes?: number
          name: string
          slug: string
          sort_order?: number
          tagline?: string | null
          wallpaper_url?: string | null
        }
        Update: {
          category?: string | null
          chats_count?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_nsfw?: boolean
          is_premium?: boolean
          likes?: number
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string | null
          wallpaper_url?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          character_id: string | null
          created_at: string
          id: string
          last_message_at: string
          title: string | null
          user_id: string
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          title?: string | null
          user_id: string
        }
        Update: {
          character_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      deaths: {
        Row: {
          cause: string | null
          character_id: string | null
          created_at: string
          id: string
          story_id: string | null
          user_id: string
        }
        Insert: {
          cause?: string | null
          character_id?: string | null
          created_at?: string
          id?: string
          story_id?: string | null
          user_id: string
        }
        Update: {
          cause?: string | null
          character_id?: string | null
          created_at?: string
          id?: string
          story_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deaths_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deaths_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "story_realms"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["message_role"]
          user_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["message_role"]
          user_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["message_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          created_at: string
          delta: number
          id: string
          metadata: Json | null
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          metadata?: Json | null
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          metadata?: Json | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_premium: boolean
          points: number
          spice_enabled: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_premium?: boolean
          points?: number
          spice_enabled?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_premium?: boolean
          points?: number
          spice_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      story_realms: {
        Row: {
          chats_count: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_nsfw: boolean
          is_premium: boolean
          likes: number
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          chats_count?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_nsfw?: boolean
          is_premium?: boolean
          likes?: number
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          chats_count?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_nsfw?: boolean
          is_premium?: boolean
          likes?: number
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          expires_at: string | null
          id: string
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      syndicates: {
        Row: {
          chats_count: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_nsfw: boolean
          is_premium: boolean
          likes: number
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          chats_count?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_nsfw?: boolean
          is_premium?: boolean
          likes?: number
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          chats_count?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_nsfw?: boolean
          is_premium?: boolean
          likes?: number
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      user_abilities: {
        Row: {
          ability_id: string
          acquired_at: string
          equipped: boolean
          id: string
          last_used_at: string | null
          user_id: string
          uses_remaining: number | null
        }
        Insert: {
          ability_id: string
          acquired_at?: string
          equipped?: boolean
          id?: string
          last_used_at?: string | null
          user_id: string
          uses_remaining?: number | null
        }
        Update: {
          ability_id?: string
          acquired_at?: string
          equipped?: boolean
          id?: string
          last_used_at?: string | null
          user_id?: string
          uses_remaining?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_abilities_ability_id_fkey"
            columns: ["ability_id"]
            isOneToOne: false
            referencedRelation: "abilities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          alive: boolean
          branch_choices: Json
          checkpoint: string | null
          id: string
          restart_count: number
          story_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alive?: boolean
          branch_choices?: Json
          checkpoint?: string | null
          id?: string
          restart_count?: number
          story_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alive?: boolean
          branch_choices?: Json
          checkpoint?: string | null
          id?: string
          restart_count?: number
          story_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "story_realms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      app_role: "admin" | "moderator" | "user"
      message_role: "user" | "assistant" | "system"
      subscription_status: "active" | "canceled" | "expired" | "trialing"
      subscription_tier: "free" | "stellar" | "nebula" | "singularity"
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
      app_role: ["admin", "moderator", "user"],
      message_role: ["user", "assistant", "system"],
      subscription_status: ["active", "canceled", "expired", "trialing"],
      subscription_tier: ["free", "stellar", "nebula", "singularity"],
    },
  },
} as const
