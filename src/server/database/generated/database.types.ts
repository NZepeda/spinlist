export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      album_artists: {
        Row: {
          album_id: string;
          artist_id: string;
          position: number;
        };
        Insert: {
          album_id: string;
          artist_id: string;
          position: number;
        };
        Update: {
          album_id?: string;
          artist_id?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "album_artists_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "album_artists_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
        ];
      };
      albums: {
        Row: {
          id: string;
          images: Json;
          release_group_id: string | null;
          release_year: number | null;
          slug: string;
          spotify_id: string;
          title: string;
          tracklist: Json;
          type: string;
          upc: string | null;
        };
        Insert: {
          id?: string;
          images?: Json;
          release_group_id?: string | null;
          release_year?: number | null;
          slug: string;
          spotify_id: string;
          title: string;
          tracklist?: Json;
          type: string;
          upc?: string | null;
        };
        Update: {
          id?: string;
          images?: Json;
          release_group_id?: string | null;
          release_year?: number | null;
          slug?: string;
          spotify_id?: string;
          title?: string;
          tracklist?: Json;
          type?: string;
          upc?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "albums_release_group_id_fkey";
            columns: ["release_group_id"];
            isOneToOne: false;
            referencedRelation: "release_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      artists: {
        Row: {
          discography_last_synced_at: string | null;
          id: string;
          images: Json;
          name: string;
          slug: string;
          spotify_id: string;
        };
        Insert: {
          discography_last_synced_at?: string | null;
          id?: string;
          images?: Json;
          name: string;
          slug: string;
          spotify_id: string;
        };
        Update: {
          discography_last_synced_at?: string | null;
          id?: string;
          images?: Json;
          name?: string;
          slug?: string;
          spotify_id?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          created_at: string;
          id: string;
          position: number;
          release_group_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          position: number;
          release_group_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          position?: number;
          release_group_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_release_group_id_fkey";
            columns: ["release_group_id"];
            isOneToOne: false;
            referencedRelation: "release_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          created_at: string;
          followed_id: string;
          follower_id: string;
        };
        Insert: {
          created_at?: string;
          followed_id: string;
          follower_id: string;
        };
        Update: {
          created_at?: string;
          followed_id?: string;
          follower_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_followed_id_fkey";
            columns: ["followed_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      mappings: {
        Row: {
          artist_id: string | null;
          id: string;
          provider_id: string;
          provider_name: string;
          release_group_id: string | null;
          upc: string | null;
        };
        Insert: {
          artist_id?: string | null;
          id?: string;
          provider_id: string;
          provider_name: string;
          release_group_id?: string | null;
          upc?: string | null;
        };
        Update: {
          artist_id?: string | null;
          id?: string;
          provider_id?: string;
          provider_name?: string;
          release_group_id?: string | null;
          upc?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mappings_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mappings_release_group_id_fkey";
            columns: ["release_group_id"];
            isOneToOne: false;
            referencedRelation: "release_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      release_group_artists: {
        Row: {
          artist_id: string;
          position: number;
          release_group_id: string;
        };
        Insert: {
          artist_id: string;
          position: number;
          release_group_id: string;
        };
        Update: {
          artist_id?: string;
          position?: number;
          release_group_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "release_group_artists_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "release_group_artists_release_group_id_fkey";
            columns: ["release_group_id"];
            isOneToOne: false;
            referencedRelation: "release_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      release_groups: {
        Row: {
          id: string;
          mb_group_id: string | null;
          original_release_year: number | null;
          slug: string;
          title: string;
          type: string;
        };
        Insert: {
          id?: string;
          mb_group_id?: string | null;
          original_release_year?: number | null;
          slug: string;
          title: string;
          type: string;
        };
        Update: {
          id?: string;
          mb_group_id?: string | null;
          original_release_year?: number | null;
          slug?: string;
          title?: string;
          type?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          body: string | null;
          created_at: string;
          favorite_track: string | null;
          id: string;
          rating: number;
          release_group_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          favorite_track?: string | null;
          id?: string;
          rating: number;
          release_group_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          favorite_track?: string | null;
          id?: string;
          rating?: number;
          release_group_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_release_group_id_fkey";
            columns: ["release_group_id"];
            isOneToOne: false;
            referencedRelation: "release_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          id: string;
          status: string;
          username: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          status?: string;
          username: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          status?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
