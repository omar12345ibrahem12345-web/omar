// Supabase Client - Initialize with your project credentials
// ============================================
// REPLACE these values with your actual Supabase project URL and anon key

var SUPABASE_URL = 'https://edqoweveyrcarbwcoztl.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkcW93ZXZleXJjYXJid2NvenRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NTM1MjYsImV4cCI6MjEwMDAyOTUyNn0.LTF7SbxetgMuZyqlqjevg-wmUL5pobVZ58dRaWeQqvk';

// Initialize Supabase client
window.supabaseClient = null;

if (!window.supabase) {
    console.error('Supabase library not loaded. Make sure the Supabase CDN script is included before this file.');
} else {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
