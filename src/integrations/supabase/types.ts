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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          condition: string
          created_at: string
          id: string
          last_inspection: string | null
          lat: number | null
          lng: number | null
          name: string
          type: string
          updated_at: string
          village_id: string | null
        }
        Insert: {
          condition?: string
          created_at?: string
          id: string
          last_inspection?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          type: string
          updated_at?: string
          village_id?: string | null
        }
        Update: {
          condition?: string
          created_at?: string
          id?: string
          last_inspection?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          type?: string
          updated_at?: string
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          confidence: number
          created_at: string
          estimated_budget: number | null
          id: string
          notes: string | null
          period_end: string
          period_start: string
          recommended_work_types: string[] | null
          village_id: string | null
          workers_needed: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          estimated_budget?: number | null
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          recommended_work_types?: string[] | null
          village_id?: string | null
          workers_needed?: number
        }
        Update: {
          confidence?: number
          created_at?: string
          estimated_budget?: number | null
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          recommended_work_types?: string[] | null
          village_id?: string | null
          workers_needed?: number
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          asset_id: string | null
          asset_type: string | null
          created_at: string
          description: string | null
          id: string
          lat: number | null
          lng: number | null
          photo_url: string | null
          reported_by_mobile: string | null
          reported_by_name: string | null
          severity: string
          status: string
          updated_at: string
          village_id: string | null
        }
        Insert: {
          asset_id?: string | null
          asset_type?: string | null
          created_at?: string
          description?: string | null
          id: string
          lat?: number | null
          lng?: number | null
          photo_url?: string | null
          reported_by_mobile?: string | null
          reported_by_name?: string | null
          severity?: string
          status?: string
          updated_at?: string
          village_id?: string | null
        }
        Update: {
          asset_id?: string | null
          asset_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          photo_url?: string | null
          reported_by_mobile?: string | null
          reported_by_name?: string | null
          severity?: string
          status?: string
          updated_at?: string
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      villages: {
        Row: {
          block: string
          created_at: string
          district: string
          households: number
          id: string
          lat: number
          lng: number
          name: string
          population: number
          state: string
          updated_at: string
        }
        Insert: {
          block: string
          created_at?: string
          district: string
          households?: number
          id: string
          lat: number
          lng: number
          name: string
          population?: number
          state: string
          updated_at?: string
        }
        Update: {
          block?: string
          created_at?: string
          district?: string
          households?: number
          id?: string
          lat?: number
          lng?: number
          name?: string
          population?: number
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          estimated_budget: number | null
          id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
          village_id: string | null
          workers_needed: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          estimated_budget?: number | null
          id: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          village_id?: string | null
          workers_needed?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          estimated_budget?: number | null
          id?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          village_id?: string | null
          workers_needed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
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
