import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { ambientAudioSource } from "../data/audio";

export default function AudioController() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlaybackError(null);
    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        setIsPlaying(false);
        setPlaybackError(
          error instanceof Error ? error.message : "Ambient audio could not be played.",
        );
      }
    } else {
      audio.pause();
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div className="audio-controller">
      {ambientAudioSource && (
        <audio
          ref={audioRef}
          src={ambientAudioSource}
          loop
          preload="none"
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => {
            setIsPlaying(false);
            setPlaybackError("Ambient audio could not be loaded.");
          }}
        />
      )}
      <button
        className="audio-control"
        type="button"
        onClick={togglePlayback}
        disabled={!ambientAudioSource}
        aria-label={
          ambientAudioSource
            ? isPlaying
              ? "Pause ambient audio"
              : "Play ambient audio"
            : "Play ambient audio, no track supplied"
        }
        aria-pressed={isPlaying}
        title={!ambientAudioSource ? "Add a local track in src/data/audio.ts" : undefined}
      >
        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
      </button>
      <button
        className="audio-control"
        type="button"
        onClick={toggleMute}
        disabled={!ambientAudioSource}
        aria-label={
          ambientAudioSource
            ? isMuted
              ? "Unmute ambient audio"
              : "Mute ambient audio"
            : "Mute ambient audio, no track supplied"
        }
        aria-pressed={isMuted}
        title={!ambientAudioSource ? "Add a local track in src/data/audio.ts" : undefined}
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
      <span className="audio-status" role="status" aria-live="polite">
        {playbackError ?? (ambientAudioSource ? (isPlaying ? "Playing" : "Paused") : "No audio")}
      </span>
    </div>
  );
}
