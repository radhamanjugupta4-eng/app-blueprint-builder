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
          enabled: boolean
          icon: string | null
          id: string
          is_premium: boolean
          name: string
          one_time_use: boolean
          reaction_prompt: string | null
          slug: string
        }
        Insert: {
          cooldown_seconds?: number
          cost?: number
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon?: string | null
          id?: string
          is_premium?: boolean
          name: string
          one_time_use?: boolean
          reaction_prompt?: string | null
          slug: string
        }
        Update: {
          cooldown_seconds?: number
          cost?: number
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon?: string | null
          id?: string
          is_premium?: boolean
          name?: string
          one_time_use?: boolean
          reaction_prompt?: string | null
          slug?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: string
          target_id?: string | null
          target_table?: string | null
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
          last_change_reason: string | null
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
          last_change_reason?: string | null
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
          last_change_reason?: string | null
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
          aggression: number
          backstory: string | null
          banner_url: string | null
          can_kill: boolean
          category: string | null
          chats_count: number
          created_at: string
          danger: number
          description: string | null
          enable_scraping: boolean
          enabled: boolean
          friendliness: number
          greeting_message: string | null
          humor: number
          id: string
          image_url: string | null
          is_nsfw: boolean
          is_premium: boolean
          likes: number
          memory_rules: string | null
          name: string
          personality: string | null
          point_reward: number
          powers: string[] | null
          relationship_modifiers: Json
          scrape_sources: string[] | null
          slug: string
          sort_order: number
          speaking_style: string | null
          special_abilities: string[] | null
          starter_scenarios: Json
          system_prompt: string | null
          tagline: string | null
          tags: string[] | null
          tone: string | null
          traits: string[] | null
          universe: string | null
          wallpaper_url: string | null
          weaknesses: string[] | null
        }
        Insert: {
          aggression?: number
          backstory?: string | null
          banner_url?: string | null
          can_kill?: boolean
          category?: string | null
          chats_count?: number
          created_at?: string
          danger?: number
          description?: string | null
          enable_scraping?: boolean
          enabled?: boolean
          friendliness?: number
          greeting_message?: string | null
          humor?: number
          id?: string
          image_url?: string | null
          is_nsfw?: boolean
          is_premium?: boolean
          likes?: number
          memory_rules?: string | null
          name: string
          personality?: string | null
          point_reward?: number
          powers?: string[] | null
          relationship_modifiers?: Json
          scrape_sources?: string[] | null
          slug: string
          sort_order?: number
          speaking_style?: string | null
          special_abilities?: string[] | null
          starter_scenarios?: Json
          system_prompt?: string | null
          tagline?: string | null
          tags?: string[] | null
          tone?: string | null
          traits?: string[] | null
          universe?: string | null
          wallpaper_url?: string | null
          weaknesses?: string[] | null
        }
        Update: {
          aggression?: number
          backstory?: string | null
          banner_url?: string | null
          can_kill?: boolean
          category?: string | null
          chats_count?: number
          created_at?: string
          danger?: number
          description?: string | null
          enable_scraping?: boolean
          enabled?: boolean
          friendliness?: number
          greeting_message?: string | null
          humor?: number
          id?: string
          image_url?: string | null
          is_nsfw?: boolean
          is_premium?: boolean
          likes?: number
          memory_rules?: string | null
          name?: string
          personality?: string | null
          point_reward?: number
          powers?: string[] | null
          relationship_modifiers?: Json
          scrape_sources?: string[] | null
          slug?: string
          sort_order?: number
          speaking_style?: string | null
          special_abilities?: string[] | null
          starter_scenarios?: Json
          system_prompt?: string | null
          tagline?: string | null
          tags?: string[] | null
          tone?: string | null
          traits?: string[] | null
          universe?: string | null
          wallpaper_url?: string | null
          weaknesses?: string[] | null
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
      level_history: {
        Row: {
          created_at: string
          from_level: number
          id: string
          to_level: number
          user_id: string
        }
        Insert: {
          created_at?: string
          from_level: number
          id?: string
          to_level: number
          user_id: string
        }
        Update: {
          created_at?: string
          from_level?: number
          id?: string
          to_level?: number
          user_id?: string
        }
        Relationships: []
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
      moderation_logs: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          reason: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
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
          banned: boolean
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_premium: boolean
          points: number
          spice_enabled: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          banned?: boolean
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          is_premium?: boolean
          points?: number
          spice_enabled?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          banned?: boolean
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_premium?: boolean
          points?: number
          spice_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      relationship_history: {
        Row: {
          character_id: string
          created_at: string
          delta: number
          id: string
          new_value: number
          reason: string | null
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          delta: number
          id?: string
          new_value: number
          reason?: string | null
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          delta?: number
          id?: string
          new_value?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      story_realms: {
        Row: {
          branches: Json
          chats_count: number
          checkpoints: Json
          created_at: string
          description: string | null
          enabled: boolean
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
          branches?: Json
          chats_count?: number
          checkpoints?: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
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
          branches?: Json
          chats_count?: number
          checkpoints?: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
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
          total_uses: number
          use_history: Json
          user_id: string
          uses_remaining: number | null
        }
        Insert: {
          ability_id: string
          acquired_at?: string
          equipped?: boolean
          id?: string
          last_used_at?: string | null
          total_uses?: number
          use_history?: Json
          user_id: string
          uses_remaining?: number | null
        }
        Update: {
          ability_id?: string
          acquired_at?: string
          equipped?: boolean
          id?: string
          last_used_at?: string | null
          total_uses?: number
          use_history?: Json
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
      user_levels: {
        Row: {
          level: number
          total_hours: number
          total_messages: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          level?: number
          total_hours?: number
          total_messages?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          level?: number
          total_hours?: number
          total_messages?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
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
      compute_level: { Args: { _total_hours: number }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_owner: { Args: { _user_id: string }; Returns: boolean }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      owner_gift_points: {
        Args: { _amount: number; _reason?: string; _user_id: string }
        Returns: undefined
      }
      owner_set_premium: {
        Args: { _is_premium: boolean; _user_id: string }
        Returns: undefined
      }
      relationship_label: { Args: { _score: number }; Returns: string }
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
