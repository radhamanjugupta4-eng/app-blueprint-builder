// Shared types and static fallback art used by the catalog grids.
import char1 from "@/assets/char-1.jpg";
import char2 from "@/assets/char-2.jpg";
import char3 from "@/assets/char-3.jpg";
import realm1 from "@/assets/realm-1.jpg";
import realm2 from "@/assets/realm-2.jpg";

export type Card = {
  id: string; // slug used in URLs
  name: string;
  image: string;
  likes: string;
  chats: string;
  danger?: 1 | 2 | 3 | 4 | 5;
  tag?: string;
  isPremium?: boolean;
  isNsfw?: boolean;
};

const FALLBACK = [char1, char2, char3, realm1, realm2];
export const fallbackImage = (i: number) => FALLBACK[i % FALLBACK.length];

const fmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `${n}`;

export type CatalogRow = {
  slug: string;
  name?: string | null;
  title?: string | null;
  image_url?: string | null;
  likes: number;
  chats_count: number;
  is_premium: boolean;
  is_nsfw: boolean;
};

export function rowToCard(row: CatalogRow, idx: number, tag?: string): Card {
  return {
    id: row.slug,
    name: (row.name ?? row.title ?? "Untitled") as string,
    image: row.image_url || fallbackImage(idx),
    likes: fmt(row.likes ?? 0),
    chats: fmt(row.chats_count ?? 0),
    danger: ((idx % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    tag,
    isPremium: row.is_premium,
    isNsfw: row.is_nsfw,
  };
}

export const plans = [
  { name: "Stellar", price: 9, features: ["1,000 monthly points", "Access to all entities", "Standard chat speed"] },
  { name: "Nebula", price: 19, features: ["3,000 monthly points", "Syndicate access", "Priority responses", "Tangly unlock"], highlight: true },
  { name: "Singularity", price: 39, features: ["10,000 monthly points", "All abilities free", "Custom realm slots", "Voice replies", "Early features"] },
];
