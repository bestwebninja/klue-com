import { getDefaultCommandCenterInstance } from "@/integrations/supabase/command-center/queries";

export const commandCenterService = {
  async resolveDefaultInstance(userId: string) {
    const { data, error } = await getDefaultCommandCenterInstance(userId);
    if (error) throw error;
    return data;
  },
};
