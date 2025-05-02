import { useState } from "react";
import Select from "react-select";
import { generateObject } from "ai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import optionsJSON from "../utils/options.json";
import { Box, Button, LoadingSpinner, SongCard, TextInput } from "./ui-library";
import { threeSongsSchema } from "~/utils/songSchema";
import { SongRecommendations } from "~/utils/songSchema";

interface Message {
  isUser: boolean;
  text: string;
}

interface MessageParam {
  role: "user" | "assistant";
  content: string;
}

const mapOptions = (options: string[]) =>
  options.map((option) => ({
    value: option.toLowerCase(),
    label: option,
  }));

const googleClient = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
});

const sGenreOptions = mapOptions(optionsJSON.Simple.Genre);
const sThemeOptions = mapOptions(optionsJSON.Simple.Theme);
const sTempoOptions = mapOptions(optionsJSON.Simple.Tempo);

const aGenreOptions = mapOptions(optionsJSON.Advanced.Genre);
const aThemeOptions = mapOptions(optionsJSON.Advanced.Theme);
const aTempoOptions = mapOptions(optionsJSON.Advanced.Tempo);

const selectStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "#F8C630",
    border: "none",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      border: "1px solid #724E91",
      scale: "1.1",
    },
    "&:focus": {
      backgroundColor: "#ed8936",
    },
    boxShadow: "4px solid #E54F6D",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#451F55",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#F8C630"
      : state.isFocused
      ? "#E54F6D"
      : "white",
    color: state.isSelected ? "white" : "black",
    "&:hover": {
      backgroundColor: "#E54F6D",
      color: "white",
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#451F55",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#0F0326",
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: "#0F0326",
  }),
};

const DiscoverMusic = () => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedTempo, setSelectedTempo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("No additional information");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [songs, setSongs] = useState<SongRecommendations | null>(null);

  const getSpotifyAccessToken = async () => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(
          `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${
            import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
          }`
        )}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify access token");
    }

    const data = await response.json();
    return data.access_token;
  };

  const fetchSpotifyLink = async (trackName: string, artist: string) => {
    const accessToken = await getSpotifyAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=artist:${artist} track:${trackName}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify link");
    }

    const data = await response.json();
    return data.tracks.items[0]?.external_urls.spotify || "";
  };

  const fetchAlbumCover = async (artistName: string, albumName: string) => {
    try {
      const response = await fetch(
        `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${
          import.meta.env.VITE_LASTFM_API_KEY
        }&artist=${artistName}&album=${albumName}&format=json`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch album cover");
      }

      const data = await response.json();
      return data.album?.image[3]["#text"] || "public/album_placeholder.png";
    } catch {
      return "public/album_placeholder.png";
    }
  };

  const sendMessageWithAI = async () => {
    if (!selectedGenre || !selectedTheme || !selectedTempo) return;

    setLoading(true);
    setError(null);

    try {
      const prompt = `You are a music recommendation bot. Generate 3 songs that match the following criteria:
      - Genre: ${selectedGenre}
      - Theme: ${selectedTheme}
      - Tempo: ${selectedTempo}
      - Additional information: ${inputText}
      
      Each song should be unique and interesting. Include songs that are both well-known and more obscure.
      For each song, provide:
      - Title
      - Artist name
      - Album name
      - Release year
      - Genre (up to 2 genres separated by comma)
      
      IMPORTANT: For albumcover, use "/public/album_placeholder.png" and DO NOT use any example.com URLs or placeholder URLs. Just set albumcover to "/public/album_placeholder.png" and we will replace it with the actual image later.
      
      Format the response exactly as requested by the schema.`;

      const { object: songRecommendations } = await generateObject({
        model: googleClient.chat("gemini-1.5-flash"),
        schema: threeSongsSchema,
        prompt,
      });

      const enhancedSongs = { ...songRecommendations };

      for (const key of ["1", "2", "3"] as const) {
        const song = enhancedSongs[key];

        if (
          !song.albumcover ||
          song.albumcover.includes("example.com") ||
          song.albumcover.includes("placeholder") ||
          !song.albumcover.startsWith("/")
        ) {
          song.albumcover = "/album_placeholder.png";
        }

        try {
          song.link.spotify = await fetchSpotifyLink(song.title, song.artist);
        } catch (error) {
          console.error(
            `Error fetching Spotify link for ${song.title}:`,
            error
          );
        }

        try {
          const albumCover = await fetchAlbumCover(song.artist, song.album);
          if (albumCover && albumCover !== "public/album_placeholder.png") {
            song.albumcover = albumCover;
          }
        } catch (error) {
          console.error(`Error fetching album cover for ${song.title}:`, error);
        }
      }

      setSongs(enhancedSongs);

      setMessages((prev) => [
        ...prev,
        {
          isUser: true,
          text: `Genre: ${selectedGenre}, Theme: ${selectedTheme}, Tempo: ${selectedTempo}, Info: ${inputText}`,
        },
        { isUser: false, text: JSON.stringify(enhancedSongs, null, 2) },
      ]);

      // Reset input text
      setInputText("No additional information");
    } catch (err: unknown) {
      console.error("Error:", err);
      setError(
        (err as Error).message ||
          "An error occurred while generating recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-4 w-2/3">
      <form
        className="w-full flex flex-col items-center"
        onSubmit={(e) => e.preventDefault()}
      >
        <h1 className="font-bold mb-4 text-saffron drop-shadow-textShadow2 !shadow-blush">
          Discover new music!
        </h1>

        <div className="flex flex-col justify-center mt-8">
          <div className="flex justify-center">
            <input
              type="checkbox"
              id="toggle"
              onChange={(e) => setAdvanced(e.target.checked)}
              className="mr-2 accent-saffron"
            />
            <h6>Advanced options?</h6>
          </div>
          <div className="flex items-center space-x-4 mb-4 mt-8">
            <h6>Genre</h6>
            <Select
              options={advanced ? aGenreOptions : sGenreOptions}
              styles={selectStyles}
              onChange={(option) => setSelectedGenre(option?.value || null)}
              required
            />
            <h6>Theme</h6>
            <Select
              options={advanced ? aThemeOptions : sThemeOptions}
              styles={selectStyles}
              onChange={(option) => setSelectedTheme(option?.value || null)}
              required
            />
            <h6>Tempo</h6>
            <Select
              options={advanced ? aTempoOptions : sTempoOptions}
              styles={selectStyles}
              onChange={(option) => setSelectedTempo(option?.value || null)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col items-center w-full">
          <TextInput
            className="w-96"
            placeholder="Anything you want to specify? (Optional)"
            value={inputText === "No additional information" ? "" : inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />

          {!selectedGenre || !selectedTheme || !selectedTempo ? (
            <p className="text-red-500 mt-4 text-xs">
              Please select genre, theme and tempo to get recommendations.
            </p>
          ) : null}

          <Button
            onClick={sendMessageWithAI}
            disabled={
              loading || !selectedGenre || !selectedTheme || !selectedTempo
            }
            type="submit"
            className="disabled:bg-blush disabled:!shadow-ultraViolet disabled:cursor-not-allowed"
          >
            {loading ? "Retrieving songs..." : "Get recommendations"}
          </Button>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <strong className="font-bold">Error:</strong> {error}
          </div>
        )}

        <div className="flex flex-wrap justify-center space-x-4 mt-4">
          {loading ? (
            <div>
              <LoadingSpinner />
              <h1 className="sr-only">Loading songs</h1>
            </div>
          ) : (
            songs &&
            Object.entries(songs).map(([key, song]) => (
              <SongCard key={key} song={song} />
            ))
          )}
        </div>
      </form>
    </Box>
  );
};

export default DiscoverMusic;
