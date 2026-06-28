/*
  supabase.js
  sets up the one supabase client every other js file uses to talk to the database.
  loaded first via a script tag in each html file, before any other js runs
*/

// project url and the publishable (anon) key, safe to expose in client side code
// this key only lets requests through, actual security comes from RLS policies on each table
// window.supabase comes from the supabase cdn script tag loaded in the html before this file
const SUPABASE_URL = 'https://bgrxggocdynwvniowgxn.supabase.co'
const SUPABASE_KEY = 'sb_publishable_J15tbRPzMgJiq65JbwTwlw_yRdCRk0Q'

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)