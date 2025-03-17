import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabaseUrl = "https://furctjascrfvjbzbljlc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1cmN0amFzY3JmdmpiemJsamxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MDU0NjQsImV4cCI6MjA1Mjk4MTQ2NH0.W-ZPb75HRLPBtxQITE6O8UozjJ_5HO6JT6nFzhQPFXU";
console.log(supabaseAnonKey, supabaseUrl);
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);