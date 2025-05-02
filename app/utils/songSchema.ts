import { z } from "zod";

const songSchema = z.object({
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  released: z.string(),
  genre: z.string(),
  albumcover: z.string().default("/public/album_placeholder.png"),
  link: z.object({
    spotify: z.string().default(""),
    youtube: z.string().default(""),
  }),
});

export const threeSongsSchema = z.object({
  "1": songSchema,
  "2": songSchema,
  "3": songSchema,
});

export type SongRecommendations = z.infer<typeof threeSongsSchema>;
