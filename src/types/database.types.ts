export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      a_profiles: {
        Row: {
          account: string
          created_at: string
          description: string
          image: string
          image_medium: string
          image_small: string
          name: string
          place_id: number | null
          token_id: string
          updated_at: string
          username: string
        }
        Insert: {
          account: string
          created_at?: string
          description?: string
          image?: string
          image_medium?: string
          image_small?: string
          name?: string
          place_id?: number | null
          token_id?: string
          updated_at?: string
          username: string
        }
        Update: {
          account?: string
          created_at?: string
          description?: string
          image?: string
          image_medium?: string
          image_small?: string
          name?: string
          place_id?: number | null
          token_id?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "a_profiles_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      a_transactions: {
        Row: {
          created_at: string
          description: string
          from: string
          hash: string
          id: string
          status: string
          to: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string
          from: string
          hash: string
          id: string
          status?: string
          to: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          description?: string
          from?: string
          hash?: string
          id?: string
          status?: string
          to?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "Transactions_from_fkey"
            columns: ["from"]
            isOneToOne: false
            referencedRelation: "a_profiles"
            referencedColumns: ["account"]
          },
          {
            foreignKeyName: "Transactions_to_fkey"
            columns: ["to"]
            isOneToOne: false
            referencedRelation: "a_profiles"
            referencedColumns: ["account"]
          },
        ]
      }
      businesses: {
        Row: {
          account: string | null
          business_status: Database["public"]["Enums"]["business_status"] | null
          created_at: string
          email: string | null
          id: number
          invite_code: string | null
          name: string | null
          phone: string | null
          status: string | null
          uuid: string | null
          vat_number: string | null
        }
        Insert: {
          account?: string | null
          business_status?:
            | Database["public"]["Enums"]["business_status"]
            | null
          created_at?: string
          email?: string | null
          id?: number
          invite_code?: string | null
          name?: string | null
          phone?: string | null
          status?: string | null
          uuid?: string | null
          vat_number?: string | null
        }
        Update: {
          account?: string | null
          business_status?:
            | Database["public"]["Enums"]["business_status"]
            | null
          created_at?: string
          email?: string | null
          id?: number
          invite_code?: string | null
          name?: string | null
          phone?: string | null
          status?: string | null
          uuid?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      old_Accounts: {
        Row: {
          account_name: string | null
          address: string
          linked_user_id: number | null
          status: string | null
          TransactionsFrom: string | null
          TransactionsTo: string | null
          wallet_type: string | null
        }
        Insert: {
          account_name?: string | null
          address: string
          linked_user_id?: number | null
          status?: string | null
          TransactionsFrom?: string | null
          TransactionsTo?: string | null
          wallet_type?: string | null
        }
        Update: {
          account_name?: string | null
          address?: string
          linked_user_id?: number | null
          status?: string | null
          TransactionsFrom?: string | null
          TransactionsTo?: string | null
          wallet_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Accounts_linked_user_id_fkey"
            columns: ["linked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      old_ledger: {
        Row: {
          Amount: number | null
          "Amount with symbol": string | null
          "blockexplorer URL": string | null
          Blocknumber: number | null
          ChainID: string | null
          DateTime: string | null
          Description: string | null
          Error: string | null
          From: string | null
          "From - file import": string | null
          "From account name": string | null
          Method: string | null
          Source: string | null
          Status: string | null
          To: string | null
          "To - file import": string | null
          "To account name": string | null
          TransactionHash: string
          UnixTimestamp: number | null
        }
        Insert: {
          Amount?: number | null
          "Amount with symbol"?: string | null
          "blockexplorer URL"?: string | null
          Blocknumber?: number | null
          ChainID?: string | null
          DateTime?: string | null
          Description?: string | null
          Error?: string | null
          From?: string | null
          "From - file import"?: string | null
          "From account name"?: string | null
          Method?: string | null
          Source?: string | null
          Status?: string | null
          To?: string | null
          "To - file import"?: string | null
          "To account name"?: string | null
          TransactionHash: string
          UnixTimestamp?: number | null
        }
        Update: {
          Amount?: number | null
          "Amount with symbol"?: string | null
          "blockexplorer URL"?: string | null
          Blocknumber?: number | null
          ChainID?: string | null
          DateTime?: string | null
          Description?: string | null
          Error?: string | null
          From?: string | null
          "From - file import"?: string | null
          "From account name"?: string | null
          Method?: string | null
          Source?: string | null
          Status?: string | null
          To?: string | null
          "To - file import"?: string | null
          "To account name"?: string | null
          TransactionHash?: string
          UnixTimestamp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_From_fkey"
            columns: ["From"]
            isOneToOne: false
            referencedRelation: "old_Accounts"
            referencedColumns: ["address"]
          },
          {
            foreignKeyName: "ledger_To_fkey"
            columns: ["To"]
            isOneToOne: false
            referencedRelation: "old_Accounts"
            referencedColumns: ["address"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string
          due: number | null
          id: number
          items: Json | null
          place_id: number | null
          status: string | null
          total: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due?: number | null
          id?: number
          items?: Json | null
          place_id?: number | null
          status?: string | null
          total?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due?: number | null
          id?: number
          items?: Json | null
          place_id?: number | null
          status?: string | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          accounts: Json | null
          business_id: number | null
          created_at: string
          id: number
          name: string | null
          slug: string | null
        }
        Insert: {
          accounts?: Json | null
          business_id?: number | null
          created_at?: string
          id?: number
          name?: string | null
          slug?: string | null
        }
        Update: {
          accounts?: Json | null
          business_id?: number | null
          created_at?: string
          id?: number
          name?: string | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          emoji: string | null
          id: number
          image: string | null
          name: string | null
          order: number
          place_id: number | null
          price: number | null
          vat: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: number
          image?: string | null
          name?: string | null
          order?: number
          place_id?: number | null
          price?: number | null
          vat?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: number
          image?: string | null
          name?: string | null
          order?: number
          place_id?: number | null
          price?: number | null
          vat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_items_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      t_events_100: {
        Row: {
          contract: string
          created_at: string
          event_signature: string
          name: string
          updated_at: string
        }
        Insert: {
          contract: string
          created_at?: string
          event_signature: string
          name: string
          updated_at?: string
        }
        Update: {
          contract?: string
          created_at?: string
          event_signature?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      t_logs_100: {
        Row: {
          created_at: string
          data: Json | null
          dest: string
          hash: string
          nonce: number
          sender: string
          status: string
          tx_hash: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          dest: string
          hash: string
          nonce: number
          sender: string
          status?: string
          tx_hash: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          dest?: string
          hash?: string
          nonce?: number
          sender?: string
          status?: string
          tx_hash?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      t_logs_data_100: {
        Row: {
          created_at: string
          data: Json | null
          hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      t_push_token_100_0x56cc38bda01be6ec6d854513c995f6621ee71229: {
        Row: {
          account: string
          created_at: string
          token: string
          updated_at: string
        }
        Insert: {
          account: string
          created_at?: string
          token: string
          updated_at?: string
        }
        Update: {
          account?: string
          created_at?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      t_push_token_100_0x5815e61ef72c9e6107b5c5a05fd121f334f7a7f1: {
        Row: {
          account: string
          created_at: string
          token: string
          updated_at: string
        }
        Insert: {
          account: string
          created_at?: string
          token: string
          updated_at?: string
        }
        Update: {
          account?: string
          created_at?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      t_sponsors_100: {
        Row: {
          contract: string
          created_at: string
          pk: string
          updated_at: string
        }
        Insert: {
          contract: string
          created_at?: string
          pk: string
          updated_at?: string
        }
        Update: {
          contract?: string
          created_at?: string
          pk?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          id: number
          linked_business_id: number | null
          magic_link: string | null
          name: string | null
          usergroup: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: number
          linked_business_id?: number | null
          magic_link?: string | null
          name?: string | null
          usergroup?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: number
          linked_business_id?: number | null
          magic_link?: string | null
          name?: string | null
          usergroup?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Users_linked_business_id_fkey"
            columns: ["linked_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
      business_status: "verified" | "created"
      user_status: "signed up" | "onboarding completed"
      wallet_type: "kiosk" | "app" | "pos app"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
