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
      bakeries: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          radius_km: number
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          radius_km?: number
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          radius_km?: number
          user_id?: string
        }
        Relationships: []
      }
      campaign_messages: {
        Row: {
          body: string | null
          campaign_id: string
          created_at: string
          id: string
          step_number: number
          subject: string | null
        }
        Insert: {
          body?: string | null
          campaign_id: string
          created_at?: string
          id?: string
          step_number: number
          subject?: string | null
        }
        Update: {
          body?: string | null
          campaign_id?: string
          created_at?: string
          id?: string
          step_number?: number
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_prospects: {
        Row: {
          campaign_id: string
          created_at: string | null
          current_step: number | null
          id: string
          instantly_lead_id: string | null
          last_sent_at: string | null
          prospect_id: string
          replied_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          current_step?: number | null
          id?: string
          instantly_lead_id?: string | null
          last_sent_at?: string | null
          prospect_id: string
          replied_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          current_step?: number | null
          id?: string
          instantly_lead_id?: string | null
          last_sent_at?: string | null
          prospect_id?: string
          replied_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_prospects_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_prospects_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          bakery_id: string
          created_at: string
          id: string
          instantly_campaign_id: string | null
          instantly_status: string | null
          started_at: string | null
          status: string
          target_category_id: string | null
          wave_size: number
        }
        Insert: {
          bakery_id: string
          created_at?: string
          id?: string
          instantly_campaign_id?: string | null
          instantly_status?: string | null
          started_at?: string | null
          status?: string
          target_category_id?: string | null
          wave_size?: number
        }
        Update: {
          bakery_id?: string
          created_at?: string
          id?: string
          instantly_campaign_id?: string | null
          instantly_status?: string | null
          started_at?: string | null
          status?: string
          target_category_id?: string | null
          wave_size?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_bakery_id_fkey"
            columns: ["bakery_id"]
            isOneToOne: false
            referencedRelation: "bakeries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_target_category_id_fkey"
            columns: ["target_category_id"]
            isOneToOne: false
            referencedRelation: "prospect_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      email_events: {
        Row: {
          body: string | null
          campaign_prospect_id: string
          created_at: string | null
          event_type: string
          id: number
          occurred_at: string
          raw: Json | null
          step_number: number | null
          subject: string | null
        }
        Insert: {
          body?: string | null
          campaign_prospect_id: string
          created_at?: string | null
          event_type: string
          id?: number
          occurred_at: string
          raw?: Json | null
          step_number?: number | null
          subject?: string | null
        }
        Update: {
          body?: string | null
          campaign_prospect_id?: string
          created_at?: string | null
          event_type?: string
          id?: number
          occurred_at?: string
          raw?: Json | null
          step_number?: number | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_campaign_prospect_id_fkey"
            columns: ["campaign_prospect_id"]
            isOneToOne: false
            referencedRelation: "campaign_prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          bakery_id: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number | null
        }
        Insert: {
          bakery_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number | null
        }
        Update: {
          bakery_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_bakery_id_fkey"
            columns: ["bakery_id"]
            isOneToOne: false
            referencedRelation: "bakeries"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_messages: {
        Row: {
          body: string | null
          cible: string | null
          created_at: string
          id: string
          session_id: string
          step_number: number
          subject: string | null
        }
        Insert: {
          body?: string | null
          cible?: string | null
          created_at?: string
          id?: string
          session_id: string
          step_number: number
          subject?: string | null
        }
        Update: {
          body?: string | null
          cible?: string | null
          created_at?: string
          id?: string
          session_id?: string
          step_number?: number
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_offers: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_selected: boolean
          name: string
          price: number | null
          session_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_selected?: boolean
          name?: string
          price?: number | null
          session_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_selected?: boolean
          name?: string
          price?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_offers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_prospect_stats: {
        Row: {
          categories: Json | null
          created_at: string
          id: string
          session_id: string
          total_cibles: string | null
          total_cibles_adressables: string | null
        }
        Insert: {
          categories?: Json | null
          created_at?: string
          id?: string
          session_id: string
          total_cibles?: string | null
          total_cibles_adressables?: string | null
        }
        Update: {
          categories?: Json | null
          created_at?: string
          id?: string
          session_id?: string
          total_cibles?: string | null
          total_cibles_adressables?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_prospect_stats_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_sessions: {
        Row: {
          bakery_address: string | null
          bakery_city: string | null
          bakery_latitude: number | null
          bakery_longitude: number | null
          bakery_name: string | null
          bakery_radius_km: number | null
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bakery_address?: string | null
          bakery_city?: string | null
          bakery_latitude?: number | null
          bakery_longitude?: number | null
          bakery_name?: string | null
          bakery_radius_km?: number | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bakery_address?: string | null
          bakery_city?: string | null
          bakery_latitude?: number | null
          bakery_longitude?: number | null
          bakery_name?: string | null
          bakery_radius_km?: number | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          logo_url: string | null
          onboarding_completed: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          logo_url?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prospect_categories: {
        Row: {
          icon_name: string | null
          id: string
          name: string
        }
        Insert: {
          icon_name?: string | null
          id?: string
          name: string
        }
        Update: {
          icon_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      prospect_messages: {
        Row: {
          body: string | null
          campaign_id: string | null
          created_at: string | null
          id: string
          prospect_id: string | null
          step_number: number
          subject: string | null
        }
        Insert: {
          body?: string | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          prospect_id?: string | null
          step_number: number
          subject?: string | null
        }
        Update: {
          body?: string | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          prospect_id?: string | null
          step_number?: number
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_messages_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          address: string | null
          bakery_id: string
          category_id: string | null
          city: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          offer: string | null
          response_received_at: string | null
          status: string
        }
        Insert: {
          address?: string | null
          bakery_id: string
          category_id?: string | null
          city?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          offer?: string | null
          response_received_at?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          bakery_id?: string
          category_id?: string | null
          city?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          offer?: string | null
          response_received_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospects_bakery_id_fkey"
            columns: ["bakery_id"]
            isOneToOne: false
            referencedRelation: "bakeries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "prospect_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
