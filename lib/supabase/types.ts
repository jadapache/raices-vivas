export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'host' | 'coordinator' | 'tourist'
          community_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'host' | 'coordinator' | 'tourist'
          community_name?: string | null
          phone?: string | null
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          role?: 'host' | 'coordinator' | 'tourist'
          community_name?: string | null
          phone?: string | null
          avatar_url?: string | null
        }
      }
      experiences: {
        Row: {
          id: string
          host_id: string
          title: string
          description: string
          short_description: string | null
          location: string
          duration_hours: number
          max_participants: number
          price_per_person: number
          included_items: string[] | null
          requirements: string | null
          images: string[] | null
          status: 'pending' | 'approved' | 'rejected'
          coordinator_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          host_id: string
          title: string
          description: string
          short_description?: string | null
          location: string
          duration_hours: number
          max_participants: number
          price_per_person: number
          included_items?: string[] | null
          requirements?: string | null
          images?: string[] | null
        }
        Update: {
          title?: string
          description?: string
          short_description?: string | null
          location?: string
          duration_hours?: number
          max_participants?: number
          price_per_person?: number
          included_items?: string[] | null
          requirements?: string | null
          images?: string[] | null
          status?: 'pending' | 'approved' | 'rejected'
          coordinator_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          experience_id: string
          tourist_id: string
          booking_date: string
          participants: number
          total_amount: number
          status: 'pending' | 'confirmed' | 'cancelled'
          special_requests: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          experience_id: string
          tourist_id: string
          booking_date: string
          participants: number
          total_amount: number
          special_requests?: string | null
          contact_email: string
          contact_phone?: string | null
        }
        Update: {
          booking_date?: string
          participants?: number
          total_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          special_requests?: string | null
          contact_email?: string
          contact_phone?: string | null
        }
      }
    }
  }
}
