export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "sales" | "marketing";
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";
export type ActivityType =
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "stage_change"
  | "assignment"
  | "system";
export type WorkflowTrigger = "lead_created" | "stage_changed" | "tag_added";
export type WorkflowActionType = "send_email" | "assign_to" | "add_tag" | "webhook";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      pipeline_stages: {
        Row: {
          id: string;
          name: string;
          position: number;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          position: number;
          color?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          position?: number;
          color?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          color?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          website: string | null;
          status: LeadStatus;
          stage_id: string | null;
          assigned_to: string | null;
          source: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          score: number;
          notes: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
          // future: tenant_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          website?: string | null;
          status?: LeadStatus;
          stage_id?: string | null;
          assigned_to?: string | null;
          source?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          score?: number;
          notes?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          website?: string | null;
          status?: LeadStatus;
          stage_id?: string | null;
          assigned_to?: string | null;
          source?: string | null;
          score?: number;
          notes?: string | null;
          metadata?: Json | null;
          updated_at?: string;
        };
      };
      lead_tags: {
        Row: {
          lead_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          lead_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      opportunities: {
        Row: {
          id: string;
          lead_id: string;
          title: string;
          value: number | null;
          currency: string;
          probability: number;
          expected_close: string | null;
          stage_id: string | null;
          assigned_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          title: string;
          value?: number | null;
          currency?: string;
          probability?: number;
          expected_close?: string | null;
          stage_id?: string | null;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          value?: number | null;
          currency?: string;
          probability?: number;
          expected_close?: string | null;
          stage_id?: string | null;
          assigned_to?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          lead_id: string;
          user_id: string | null;
          type: ActivityType;
          subject: string | null;
          body: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          user_id?: string | null;
          type: ActivityType;
          subject?: string | null;
          body?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          subject?: string | null;
          body?: string | null;
          metadata?: Json | null;
        };
      };
      workflows: {
        Row: {
          id: string;
          name: string;
          trigger: WorkflowTrigger;
          conditions: Json;
          actions: Json;
          is_active: boolean;
          run_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          trigger: WorkflowTrigger;
          conditions?: Json;
          actions?: Json;
          is_active?: boolean;
          run_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          trigger?: WorkflowTrigger;
          conditions?: Json;
          actions?: Json;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          lead_id: string;
          workflow_id: string | null;
          to_email: string;
          subject: string;
          status: string;
          error: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          workflow_id?: string | null;
          to_email: string;
          subject: string;
          status?: string;
          error?: string | null;
          sent_at?: string;
        };
        Update: {
          status?: string;
          error?: string | null;
        };
      };
      api_keys: {
        Row: {
          id: string;
          name: string;
          key_hash: string;
          key_preview: string;
          created_by: string;
          last_used_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          key_hash: string;
          key_preview: string;
          created_by: string;
          last_used_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          is_active?: boolean;
          last_used_at?: string | null;
        };
      };
    };
    Views: {
      crm_kpi: {
        Row: {
          total_leads: number;
          new_leads_today: number;
          new_leads_this_week: number;
          new_leads_this_month: number;
          won_leads: number;
          lost_leads: number;
          conversion_rate: number;
          total_pipeline_value: number;
          avg_deal_value: number;
        };
      };
    };
    Functions: {
      get_my_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type ActivityInsert = Database["public"]["Tables"]["activities"]["Insert"];
export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export type PipelineStage = Database["public"]["Tables"]["pipeline_stages"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type Workflow = Database["public"]["Tables"]["workflows"]["Row"];
export type KPI = Database["public"]["Views"]["crm_kpi"]["Row"];

// Extended types for joined queries
export type LeadWithRelations = Lead & {
  stage?: PipelineStage | null;
  assigned_profile?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  tags?: Tag[];
  activities?: Activity[];
  opportunities?: Opportunity[];
};
