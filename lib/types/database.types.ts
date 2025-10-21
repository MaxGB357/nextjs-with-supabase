/**
 * TypeScript types for Supabase database schema
 * Generated for user_metrics table
 */

export interface Database {
  public: {
    Tables: {
      user_metrics: {
        Row: {
          id: string;
          user_id: string;
          metric_name: string;
          metric_value: number;
          category: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_name: string;
          metric_value: number;
          category: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          metric_name?: string;
          metric_value?: number;
          category?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Convenience types for working with user metrics
export type UserMetric = Database['public']['Tables']['user_metrics']['Row'];
export type UserMetricInsert = Database['public']['Tables']['user_metrics']['Insert'];
export type UserMetricUpdate = Database['public']['Tables']['user_metrics']['Update'];

// Summary statistics type
export interface MetricsSummary {
  totalCount: number;
  averageValue: number;
  categoryBreakdown: Record<string, number>;
  categories: string[];
}

// Category statistics type
export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
}
