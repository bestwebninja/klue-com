import { supabase } from "@/integrations/supabase/client";

export async function uploadCommandCenterDocument(path: string, file: File) {
  return supabase.storage.from("command-center-documents").upload(path, file, { upsert: true });
}
