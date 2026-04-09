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
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dashboard_bootstraps: {
        Row: {
          created_at: string | null
          id: string
          profile_snapshot: Json | null
          role_key: string
          template_key: string
          updated_at: string | null
          user_id: string
          widget_config: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_snapshot?: Json | null
          role_key: string
          template_key: string
          updated_at?: string | null
          user_id: string
          widget_config?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_snapshot?: Json | null
          role_key?: string
          template_key?: string
          updated_at?: string | null
          user_id?: string
          widget_config?: Json | null
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          recipient_email: string
          recipient_id: string
          related_entity_id: string | null
          related_entity_type: string | null
          resend_id: string | null
          sent_at: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_id: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resend_id?: string | null
          sent_at?: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resend_id?: string | null
          sent_at?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      expert_answers: {
        Row: {
          content: string
          created_at: string
          id: string
          provider_id: string
          question_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          provider_id: string
          question_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          provider_id?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "expert_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "public_expert_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_questions: {
        Row: {
          category_id: string | null
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category_id: string | null
          created_at: string
          description: string
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          posted_by: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category_id?: string | null
          created_at?: string
          description: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          posted_by?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          posted_by?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          quote_request_id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          quote_request_id: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          quote_request_id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          expert_answers: boolean
          id: string
          job_lead_max_distance: number
          new_messages: boolean
          push_enabled: boolean
          quote_requests: boolean
          quote_responses: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          expert_answers?: boolean
          id?: string
          job_lead_max_distance?: number
          new_messages?: boolean
          push_enabled?: boolean
          quote_requests?: boolean
          quote_responses?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          expert_answers?: boolean
          id?: string
          job_lead_max_distance?: number
          new_messages?: boolean
          push_enabled?: boolean
          quote_requests?: boolean
          quote_responses?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_verifications: {
        Row: {
          attempts: number
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          verified: boolean
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          verified?: boolean
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          verified?: boolean
        }
        Relationships: []
      }
      portfolio_images: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          provider_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          provider_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          provider_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          company_name: string | null
          county: string | null
          created_at: string
          email: string | null
          featured_at: string | null
          first_name: string | null
          full_name: string | null
          id: string
          is_featured: boolean
          is_suspended: boolean
          is_verified: boolean
          last_name: string | null
          phone: string | null
          phone_verified: boolean
          services_offered: string[] | null
          state: string | null
          subscription_expires_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          suspended_at: string | null
          suspension_reason: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          county?: string | null
          created_at?: string
          email?: string | null
          featured_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          is_featured?: boolean
          is_suspended?: boolean
          is_verified?: boolean
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean
          services_offered?: string[] | null
          state?: string | null
          subscription_expires_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          county?: string | null
          created_at?: string
          email?: string | null
          featured_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_featured?: boolean
          is_suspended?: boolean
          is_verified?: boolean
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean
          services_offered?: string[] | null
          state?: string | null
          subscription_expires_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      provider_blog_posts: {
        Row: {
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          provider_id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          provider_id: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          provider_id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_locations: {
        Row: {
          address: string
          city: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          latitude: number | null
          longitude: number | null
          postcode: string | null
          provider_id: string
        }
        Insert: {
          address: string
          city?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          postcode?: string | null
          provider_id: string
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          postcode?: string | null
          provider_id?: string
        }
        Relationships: []
      }
      provider_services: {
        Row: {
          category_id: string | null
          created_at: string
          custom_name: string | null
          description: string | null
          id: string
          provider_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          custom_name?: string | null
          description?: string | null
          id?: string
          provider_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          custom_name?: string | null
          description?: string | null
          id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          created_at: string
          id: string
          job_listing_id: string | null
          message: string | null
          provider_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_listing_id?: string | null
          message?: string | null
          provider_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_listing_id?: string | null
          message?: string | null
          provider_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          job_listing_id: string | null
          provider_id: string
          provider_response: string | null
          provider_response_at: string | null
          rating: number
          reviewer_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          job_listing_id?: string | null
          provider_id: string
          provider_response?: string | null
          provider_response_at?: string | null
          rating: number
          reviewer_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          job_listing_id?: string | null
          provider_id?: string
          provider_response?: string | null
          provider_response_at?: string | null
          rating?: number
          reviewer_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
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
      verification_requests: {
        Row: {
          admin_notes: string | null
          business_name: string
          business_registration_number: string | null
          id: string
          id_document_url: string | null
          insurance_document_url: string | null
          provider_id: string
          qualifications: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          years_experience: number | null
        }
        Insert: {
          admin_notes?: string | null
          business_name: string
          business_registration_number?: string | null
          id?: string
          id_document_url?: string | null
          insurance_document_url?: string | null
          provider_id: string
          qualifications?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          years_experience?: number | null
        }
        Update: {
          admin_notes?: string | null
          business_name?: string
          business_registration_number?: string | null
          id?: string
          id_document_url?: string | null
          insurance_document_url?: string | null
          provider_id?: string
          qualifications?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      zip_code_intelligence_cache: {
        Row: {
          city: string | null
          county: string | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          refreshed_at: string | null
          state: string | null
          zip_code: string
        }
        Insert: {
          city?: string | null
          county?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          refreshed_at?: string | null
          state?: string | null
          zip_code: string
        }
        Update: {
          city?: string | null
          county?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          refreshed_at?: string | null
          state?: string | null
          zip_code?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_expert_questions: {
        Row: {
          category_id: string | null
          content: string | null
          created_at: string | null
          id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: never
        }
        Update: {
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "expert_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      public_job_listings: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string | null
          location_area: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          location_area?: never
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          location_area?: never
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      public_provider_locations: {
        Row: {
          city: string | null
          created_at: string | null
          id: string | null
          is_primary: boolean | null
          latitude: number | null
          longitude: number | null
          postcode: string | null
          provider_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string | null
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          postcode?: string | null
          provider_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string | null
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          postcode?: string | null
          provider_id?: string | null
        }
        Relationships: []
      }
      public_provider_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          is_featured: boolean | null
          is_verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_provider_role: {
        Args: { target_user_id: string }
        Returns: void
      }
      assign_user_role: {
        Args: {
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: void
      }
      count_public_job_listings: {
        Args: { p_category_id?: string }
        Returns: number
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_provider_contact_details: {
        Args: { provider_uuid: string }
        Returns: {
          email: string
          full_name: string
          id: string
          phone: string
        }[]
      }
      get_public_job_listing: {
        Args: { p_job_id: string }
        Returns: {
          budget_max: number
          budget_min: number
          category_icon: string
          category_id: string
          category_name: string
          created_at: string
          description: string
          id: string
          location_area: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_public_job_listings: {
        Args: { p_category_id?: string; p_limit?: number; p_offset?: number }
        Returns: {
          budget_max: number
          budget_min: number
          category_icon: string
          category_id: string
          category_name: string
          created_at: string
          description: string
          id: string
          location_area: string
          title: string
        }[]
      }
      get_public_job_listings_with_coords: {
        Args: never
        Returns: {
          budget_max: number
          budget_min: number
          category_id: string
          category_name: string
          created_at: string
          description: string
          id: string
          latitude: number
          location: string
          longitude: number
          title: string
        }[]
      }
      get_public_provider_locations: {
        Args: { provider_ids: string[] }
        Returns: {
          city: string
          created_at: string
          id: string
          is_primary: boolean
          latitude: number
          longitude: number
          postcode: string
          provider_id: string
        }[]
      }
      get_public_provider_profiles: {
        Args: { provider_ids: string[] }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          full_name: string
          id: string
          is_featured: boolean
          is_verified: boolean
        }[]
      }
      has_quote_relationship: {
        Args: { provider_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "provider"
      subscription_status: "free" | "active" | "cancelled" | "expired"
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
      app_role: ["admin", "moderator", "user", "provider"],
      subscription_status: ["free", "active", "cancelled", "expired"],
    },
  },
} as const
