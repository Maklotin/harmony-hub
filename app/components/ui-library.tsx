import { Link } from "@remix-run/react";
import { RemixLinkProps } from "@remix-run/react/dist/components";
import React from "react";
import { cn } from "~/utils/misc";
import fitty from "fitty";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function TextInput({ className, ...props }: TextInputProps) {
  return (
    <input
      className={cn(
        "transition-all duration-300 bg-primary border-b-4 border-bPrimary focus:border-blush outline-none hover:border-blush",
        className
      )}
      {...props}
    />
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "transition-all duration-300 hover:transform hover:scale-105 bg-saffron p-2 w-80 rounded-md !shadow-blush shadow-primaryButton hover:bg-blush text-primary hover:shadow-primaryButtonHover hover:!shadow-ultraViolet text-xl my-4 flex justify-center items-center hover:cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Box({ className, children, ...props }: BoxProps) {
  return (
    <div
      className={cn(
        "border-4 border-bPrimary rounded-3xl w-1/3 h-1/2 flex justify-center items-center flex-col shadow-blackNoFade",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Textlink({
  className,
  children,
  to,
  ...props
}: RemixLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "text-blush underline hover:text-saffron transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function ClickableLogo() {
  return (
    <div className="flex justify-start">
      <Link to="/">
        <img
          alt="Harmony Hub Logo"
          src="/HarmonyHubLogo.svg"
          draggable="false"
          className="max-w-96 p-8"
        />
      </Link>
    </div>
  );
}

interface SongCardProps {
  song: {
    title: string;
    artist: string;
    album: string;
    released: string;
    genre: string;
    albumcover: string;
    link: {
      spotify: string;
      youtube: string;
    };
  };
}

export function SongCard({
  song: { title, artist, album, released, genre, albumcover, link },
}: SongCardProps) {
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const albumRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    if (titleRef.current) {
      fitty(titleRef.current, {
        minSize: 12,
        maxSize: 24,
      });
      if (albumRef.current) {
        fitty(albumRef.current, {
          minSize: 8,
          maxSize: 16,
        });
      }
    }
  }, []);

  return (
    <Box className="w-72 py-2">
      <h4
        ref={titleRef}
        className="h-10 overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {title}
      </h4>
      <p
        ref={albumRef}
        className="text-sm overflow-hidden text-ellipsis whitespace-nowrap w-64 text-center"
      >
        {album}
      </p>
      <img
        src={albumcover}
        alt={album + " album cover"}
        className="w-60 shadow-imgShadow shadow-blush my-4"
      />
      <h5 className="overflow-hidden text-ellipsis whitespace-nowrap">
        {artist}
      </h5>
      <p className="overflow-hidden text-ellipsis whitespace-nowrap">
        {released}
      </p>
      <p className="text-xs overflow-hidden text-ellipsis whitespace-nowrap">
        {genre}
      </p>
      <Textlink to={link.spotify} target="_blank">
        Listen on Spotify
      </Textlink>
      <Textlink to={link.youtube} target="_blank">
        Watch on YouTube
      </Textlink>
    </Box>
  );
}
