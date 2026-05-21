import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { rowToCard, type Card } from "./orion-data";

async function fetchTable(table: "characters" | "story_realms" | "syndicates", tag?: string): Promise<Card[]> {
  // `characters` uses `name`; `story_realms` and `syndicates` use `title`.
  const nameCol = table === "characters" ? "name" : "title";
  const { data, error } = await supabase
    .from(table)
    .select(`slug,${nameCol},image_url,likes,chats_count,is_premium,is_nsfw,sort_order`)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r, i) => rowToCard(r as never, i, tag));
}

export const useCharacters = () =>
  useQuery({ queryKey: ["characters"], queryFn: () => fetchTable("characters") });

export const useRealms = () =>
  useQuery({ queryKey: ["realms"], queryFn: () => fetchTable("story_realms", "Realm") });

export const useSyndicates = () =>
  useQuery({ queryKey: ["syndicates"], queryFn: () => fetchTable("syndicates", "Group") });

export type AbilityRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  cost: number;
  cooldown_seconds: number;
  one_time_use: boolean;
  is_premium: boolean;
};

export const useAbilities = () =>
  useQuery({
    queryKey: ["abilities"],
    queryFn: async (): Promise<AbilityRow[]> => {
      const { data, error } = await supabase
        .from("abilities")
        .select("*")
        .order("cost", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AbilityRow[];
    },
  });

export type CharacterDetail = {
  slug: string;
  name: string;
  image_url: string | null;
  description: string | null;
  is_premium: boolean;
  is_nsfw: boolean;
  source: "characters" | "story_realms" | "syndicates";
};

export const useCharacterBySlug = (slug: string) =>
  useQuery({
    queryKey: ["character", slug],
    queryFn: async (): Promise<CharacterDetail | null> => {
      const { data: c } = await supabase
        .from("characters")
        .select("slug,name,image_url,description,is_premium,is_nsfw")
        .eq("slug", slug).maybeSingle();
      if (c) return { ...c, source: "characters" };

      const { data: r } = await supabase
        .from("story_realms")
        .select("slug,title,image_url,description,is_premium,is_nsfw")
        .eq("slug", slug).maybeSingle();
      if (r) return { slug: r.slug, name: r.title, image_url: r.image_url, description: r.description, is_premium: r.is_premium, is_nsfw: r.is_nsfw, source: "story_realms" };

      const { data: s } = await supabase
        .from("syndicates")
        .select("slug,title,image_url,description,is_premium,is_nsfw")
        .eq("slug", slug).maybeSingle();
      if (s) return { slug: s.slug, name: s.title, image_url: s.image_url, description: s.description, is_premium: s.is_premium, is_nsfw: s.is_nsfw, source: "syndicates" };

      return null;
    },
  });
