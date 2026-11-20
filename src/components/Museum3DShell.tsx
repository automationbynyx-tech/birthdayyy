import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import { ArrowDown, ChevronDown, Flower2, Heart } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { BotanicalSprig, FloatingPetals } from "./ArtMotifs";
import MuseumShell from "./MuseumShell";
import PhotoLightbox from "./PhotoLightbox";
import { exhibits } from "../data/exhibits";
import { birthdayLetter, letterPlaceholder } from "../data/letter";
import {
  LETTER_SCROLL_START_WEIGHT,
  TOTAL_ROOM_SCROLL_WEIGHT,
} from "../data/museumScroll";
import { nicknames } from "../data/nicknames";
import { photos, type MuseumPhoto } from "../data/photos";
import type { MuseumWorldProps } from "./MuseumWorld";
import "../styles/museum3d.css";

const MuseumCanvas = lazy(() => import("./MuseumCanvas"));
const LETTER_START_PROGRESS =
  LETTER_SCROLL_START_WEIGHT / TOTAL_ROOM_SCROLL_WEIGHT;
const MUSIC_TEMPO = 76;
const MUSIC_STEP_SECONDS = 60 / MUSIC_TEMPO / 4;
const MUSIC_LOOP_STEPS = 96;
const MUSIC_MELODY: (number | null)[] = [
  72, null, 76, null, 79, null, 76, null, 74, null, 72, null,
  69, null, 72, null, 74, null, 76, null, 79, null, 76, null,
];
const MUSIC_CHORDS = [
  [60, 64, 67],
  [53, 57, 60],
  [57, 60, 64],
  [55, 59, 62],
  [60, 64, 67],
  [53, 57, 60],
  [55, 59, 62],
  [60, 64, 67],
];
const MUSIC_BASS_ROOTS = [48, 53, 57, 55, 48, 53, 55, 48];

function playMusicNote(
  context: AudioContext,
  destination: GainNode,
  midi: number,
  startAt: number,
  duration: number,
  volume: number,
  type: OscillatorType,
  sparkle = false,
) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  envelope.gain.setValueAtTime(0.0001, startAt);
  envelope.gain.exponentialRampToValueAtTime(volume, startAt + 0.025);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.onended = () => {
    oscillator.disconnect();
    envelope.disconnect();
  };
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
  if (sparkle) {
    const overtone = context.createOscillator();
    const overtoneGain = context.createGain();
    overtone.type = "sine";
    overtone.frequency.value = oscillator.frequency.value * 2;
    overtoneGain.gain.setValueAtTime(0.0001, startAt);
    overtoneGain.gain.exponentialRampToValueAtTime(
      volume * 0.12,
      startAt + 0.035,
    );
    overtoneGain.gain.exponentialRampToValueAtTime(
      0.0001,
      startAt + duration * 0.72,
    );
    overtone.connect(overtoneGain);
    overtoneGain.connect(destination);
    overtone.onended = () => {
      overtone.disconnect();
      overtoneGain.disconnect();
    };
    overtone.start(startAt);
    overtone.stop(startAt + duration * 0.72 + 0.03);
  }
}

function scheduleMusicStep(
  context: AudioContext,
  destination: GainNode,
  step: number,
  startAt: number,
) {
  const beatSeconds = 60 / MUSIC_TEMPO;
  const loopStep = step % MUSIC_LOOP_STEPS;
  const bar = Math.floor(loopStep / 12);
  const beat = Math.floor((loopStep % 12) / 4);
  const melodyNote = MUSIC_MELODY[loopStep % MUSIC_MELODY.length];

  if (loopStep % 12 === 0) {
    MUSIC_CHORDS[bar].forEach((note) =>
      playMusicNote(context, destination, note, startAt, beatSeconds * 2.7, 0.022, "sine"),
    );
  }
  if (loopStep % 4 === 0) {
    const bassNote = MUSIC_BASS_ROOTS[bar] + (beat === 2 ? 7 : 0);
    playMusicNote(context, destination, bassNote, startAt, beatSeconds * 0.72, 0.055, "sine");
  }
  if (loopStep % 2 === 0 && melodyNote !== null) {
    const phrase = Math.floor(loopStep / MUSIC_MELODY.length);
    const variation = phrase === 3 ? 0 : phrase === 1 ? 2 : 0;
    playMusicNote(
      context,
      destination,
      melodyNote + variation,
      startAt,
      beatSeconds * 0.62,
      0.1,
      "sine",
      true,
    );
  }
}

function HeartLoadingIndicator() {
  const clipId = `museum-heart-${useId().replace(/:/g, "")}`;
  const heartPath =
    "M50 87 C42 80 12 59 12 38 C12 23 23 12 37 12 C43 12 48 16 50 23 C53 16 58 12 64 12 C78 12 88 23 88 38 C88 59 58 81 50 87 Z";

  return (
    <div className="museum3d-loading" role="status" aria-live="polite">
      <svg
        className="museum3d-heart-loader"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={heartPath} />
          </clipPath>
          <linearGradient id={`${clipId}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff0d6" />
            <stop offset="1" stopColor="#d9b77e" />
          </linearGradient>
        </defs>
        <path
          d={heartPath}
          fill="rgba(217, 183, 126, 0.08)"
          stroke="#fff0d6"
          strokeWidth="2.5"
        />
        <g clipPath={`url(#${clipId})`}>
          <g className="museum3d-heart-fill">
            <path
              d="M-8 0 C8 -6 22 6 38 0 S68 -6 84 0 S114 6 122 0 V105 H-8 Z"
              fill={`url(#${clipId}-water)`}
            />
            <path
              className="museum3d-heart-wave"
              d="M-8 0 C8 -6 22 6 38 0 S68 -6 84 0 S114 6 122 0"
              fill="none"
              stroke="#fff0d6"
              strokeWidth="2"
            />
          </g>
        </g>
        <path
          d={heartPath}
          fill="none"
          stroke="#fff0d6"
          strokeWidth="2.5"
        />
      </svg>
      <span>Preparing the galleries…</span>
    </div>
  );
}

export default function Museum3DShell() {
  const [entered, setEntered] = useState(false);
  const [entryLoading, setEntryLoading] = useState(false);
  const [worldReady, setWorldReady] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [markedNames, setMarkedNames] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<MuseumPhoto | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [letterCanContinue, setLetterCanContinue] = useState(false);
  const letterCanContinueRef = useRef(false);
  const scrollTrackRef = useRef<HTMLElement>(null);
  const photoTriggerRef = useRef<HTMLElement | null>(null);
  const letterDialogRef = useRef<HTMLDialogElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const musicStepRef = useRef(0);
  const nextMusicTimeRef = useRef(0);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const activeExhibit = exhibits[activeIndex];

  const beginEntry = useCallback(() => {
    if (!audioContextRef.current && window.AudioContext) {
      const context = new window.AudioContext();
      const gain = context.createGain();
      gain.gain.value = 0.075;
      gain.connect(context.destination);
      audioContextRef.current = context;
      musicGainRef.current = gain;
      nextMusicTimeRef.current = context.currentTime + 0.08;
      musicTimerRef.current = window.setInterval(() => {
        const activeContext = audioContextRef.current;
        const destination = musicGainRef.current;
        if (!activeContext || !destination) return;
        while (nextMusicTimeRef.current < activeContext.currentTime + 0.12) {
          scheduleMusicStep(
            activeContext,
            destination,
            musicStepRef.current,
            nextMusicTimeRef.current,
          );
          musicStepRef.current = (musicStepRef.current + 1) % MUSIC_LOOP_STEPS;
          nextMusicTimeRef.current += MUSIC_STEP_SECONDS;
        }
      }, 30);
      void context.resume().catch((error: unknown) => {
        console.error("Could not start the background birthday music.", error);
      });
    }
    setEntryLoading(true);
    setWorldReady(false);
    setEntered(true);
  }, []);
  const handleWorldReady = useCallback(() => setWorldReady(true), []);

  const handleRoomChange = useCallback((index: number) => {
    setActiveIndex(index);
    setMobilePanelOpen(false);
  }, []);

  useEffect(
    () => () => {
      if (musicTimerRef.current !== null) {
        window.clearInterval(musicTimerRef.current);
      }
      const context = audioContextRef.current;
      if (context && context.state !== "closed") void context.close();
    },
    [],
  );

  useEffect(() => {
    if (!entryLoading) return;
    const timer = window.setTimeout(
      () => setEntryLoading(false),
      shouldReduceMotion ? 250 : 1800,
    );
    return () => window.clearTimeout(timer);
  }, [entryLoading, shouldReduceMotion]);

  useEffect(() => {
    if (!entered) return;
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const track = scrollTrackRef.current;
      if (!track) return;
      const scrollDistance = track.scrollHeight - track.clientHeight;
      let progress =
        scrollDistance > 0
          ? Math.max(0, Math.min(1, track.scrollTop / scrollDistance))
          : 0;
      if (
        !letterCanContinueRef.current &&
        progress >= LETTER_START_PROGRESS - 0.001
      ) {
        track.scrollTop = LETTER_START_PROGRESS * scrollDistance;
        progress = LETTER_START_PROGRESS;
      }
      setScrollProgress(progress);
    };
    const scheduleProgressUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(updateProgress);
    };
    const track = scrollTrackRef.current;
    if (!track) return;
    track.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
    window.addEventListener("resize", scheduleProgressUpdate);
    updateProgress();
    return () => {
      track.removeEventListener("scroll", scheduleProgressUpdate);
      window.removeEventListener("resize", scheduleProgressUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [entered]);

  const openPhoto = useCallback((photo: MuseumPhoto, trigger?: HTMLElement) => {
    photoTriggerRef.current =
      trigger ??
      (document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null);
    setSelectedPhoto(photo);
  }, []);

  const closePhoto = useCallback(() => {
    setSelectedPhoto(null);
    requestAnimationFrame(() => {
      if (photoTriggerRef.current?.isConnected) photoTriggerRef.current.focus();
    });
  }, []);

  const changePhoto = useCallback((offset: number) => {
    setSelectedPhoto((current) => {
      if (!current) return null;
      const currentIndex = photos.findIndex((photo) => photo.id === current.id);
      const nextIndex = (currentIndex + offset + photos.length) % photos.length;
      return photos[nextIndex];
    });
  }, []);

  const toggleName = useCallback((name: string) => {
    setMarkedNames((current) =>
      current.includes(name)
        ? current.filter((markedName) => markedName !== name)
        : [...current, name],
    );
  }, []);

  useEffect(() => {
    const dialog = letterDialogRef.current;
    if (!dialog) return;
    if (letterOpen && !dialog.open) dialog.showModal();
    if (!letterOpen && dialog.open) dialog.close();
  }, [letterOpen]);

  useEffect(() => {
    if (entered && activeIndex === 3 && !letterCanContinueRef.current) {
      setLetterOpen(true);
    } else if (activeIndex !== 3) {
      setLetterOpen(false);
    }
  }, [activeIndex, entered]);

  useEffect(() => {
    if (
      entered &&
      scrollProgress >= LETTER_START_PROGRESS &&
      scrollProgress < 1
    ) {
      setActiveIndex(3);
      if (!letterCanContinueRef.current) setLetterOpen(true);
    }
  }, [entered, scrollProgress]);

  const handleLetterDialogScroll = useCallback(() => {
    const dialog = letterDialogRef.current;
    if (
      !dialog ||
      dialog.scrollTop + dialog.clientHeight < dialog.scrollHeight - 1
    ) {
      return;
    }
    letterCanContinueRef.current = true;
    setLetterCanContinue(true);
  }, []);

  const continueToCake = useCallback(() => {
    if (!letterCanContinueRef.current) return;
    const track = scrollTrackRef.current;
    if (!track) return;

    const dialog = letterDialogRef.current;
    if (dialog?.open) dialog.close();
    setLetterOpen(false);
    track.scrollTo({
      top: track.scrollHeight - track.clientHeight,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [shouldReduceMotion]);

  const handleLetterScroll = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (event.deltaY === 0) return;
      const track = scrollTrackRef.current;
      if (!track) return;

      if (!letterOpen) {
        if (
          scrollProgress >= LETTER_START_PROGRESS &&
          event.deltaY > 0 &&
          !letterCanContinueRef.current
        ) {
          setLetterOpen(true);
        }
        return;
      }

      const dialog = letterDialogRef.current;
      if (!dialog) return;
      const atBottom =
        dialog.scrollTop + dialog.clientHeight >= dialog.scrollHeight - 1;
      const atTop = dialog.scrollTop <= 1;

      if (event.deltaY > 0 && atBottom) {
        letterCanContinueRef.current = true;
        setLetterCanContinue(true);
        continueToCake();
      } else if (event.deltaY < 0 && atTop) {
        setLetterOpen(false);
        track.scrollTo({
          top: Math.max(0, track.scrollTop + event.deltaY),
          behavior: shouldReduceMotion ? "auto" : "smooth",
        });
      }
    },
    [
      continueToCake,
      letterOpen,
      scrollProgress,
      shouldReduceMotion,
    ],
  );

  if (showFallback) return <MuseumShell />;

  const worldProps: MuseumWorldProps = {
    scrollProgress,
    reducedMotion: shouldReduceMotion,
    markedNames,
    onRoomChange: handleRoomChange,
    onSelectPhoto: openPhoto,
    onToggleName: toggleName,
    onOpenLetter: () => setLetterOpen(true),
    onReady: handleWorldReady,
  };

  return (
    <main className="museum3d-shell" onWheelCapture={handleLetterScroll}>
      {!entered ? (
        <section className="museum3d-welcome" aria-labelledby="museum3d-title">
          <div className="museum3d-welcome-decor" aria-hidden="true">
            <FloatingPetals className="museum3d-welcome-petals" />
            <BotanicalSprig className="museum3d-welcome-botanical museum3d-welcome-botanical-left" />
            <BotanicalSprig className="museum3d-welcome-botanical museum3d-welcome-botanical-right" />
            <svg
              className="museum3d-welcome-light-strands"
              viewBox="0 0 1200 240"
              preserveAspectRatio="none"
            >
              <path d="M-40 28 C220 134 408 154 600 112 S960 6 1240 40" />
              <path d="M-40 182 C220 78 430 44 620 88 S980 168 1240 98" />
              {[
                [25, 42], [150, 80], [275, 109], [400, 130], [525, 134],
                [650, 104], [775, 64], [900, 30], [1025, 24], [1150, 38],
                [25, 171], [150, 125], [275, 86], [400, 62], [525, 69],
                [650, 96], [775, 130], [900, 157], [1025, 149], [1150, 112],
              ].map(([cx, cy], index) => (
                <circle
                  className="museum3d-welcome-light-bulb"
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={index % 4 === 0 ? 5 : 3.5}
                  style={{ animationDelay: `${index * 0.12}s` }}
                />
              ))}
            </svg>
            <span className="museum3d-welcome-heart museum3d-welcome-heart-left">♥</span>
            <span className="museum3d-welcome-heart museum3d-welcome-heart-right">♥</span>
          </div>
          <div className="welcome-architecture" aria-hidden="true">
            <span className="welcome-room welcome-room-back" />
            <span className="welcome-room welcome-room-left" />
            <span className="welcome-room welcome-room-right" />
            <span className="welcome-frame welcome-frame-one" />
            <span className="welcome-frame welcome-frame-two" />
            <span className="welcome-frame welcome-frame-three" />
            <span className="welcome-floor" />
          </div>
          <div className="museum3d-welcome-copy">
            <span className="museum3d-kicker">00 / THE ENTRANCE</span>
            <h1 id="museum3d-title">
              The Museum <i>of Her</i>
            </h1>
            <p>
              A private collection, now a place you can walk through.
            </p>
            <button
              type="button"
              className="museum3d-enter"
              onClick={beginEntry}
            >
              <span>Step inside the museum</span>
              <ArrowDown size={16} aria-hidden="true" />
            </button>
            <span className="museum3d-welcome-note">
              Scroll through five rooms at your own pace.
            </span>
          </div>
        </section>
      ) : (
        <section
          className="museum3d-scroll-viewport"
          ref={scrollTrackRef}
          aria-label="Scrollable 3D museum"
          tabIndex={0}
        >
          <div className="museum3d-scroll-track">
            <div className="museum3d-stage">
              <Suspense
                fallback={
                  entryLoading || !worldReady ? null : <HeartLoadingIndicator />
                }
              >
                <MuseumCanvas
                  {...worldProps}
                  onShowFallback={() => setShowFallback(true)}
                />
              </Suspense>
              {(entryLoading || !worldReady) && <HeartLoadingIndicator />}

              <aside
                className={`museum3d-room-panel${mobilePanelOpen ? " is-expanded" : " is-collapsed"}`}
                aria-live="polite"
              >
                <button
                  type="button"
                  className="museum3d-room-panel-toggle"
                  aria-expanded={mobilePanelOpen}
                  aria-controls="museum3d-room-panel-content"
                  onClick={() => setMobilePanelOpen((open) => !open)}
                >
                  <span>{activeExhibit.number} / {activeExhibit.name}</span>
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
                <div
                  className="museum3d-room-panel-content"
                  id="museum3d-room-panel-content"
                >
                  <span className="museum3d-kicker">
                    {activeExhibit.number} / {activeExhibit.name}
                  </span>
                  <h1>{activeExhibit.title}</h1>
                  <p>{activeExhibit.description}</p>
                  <div className="museum3d-accessible-content">
                  {activeIndex === 0 && (
                    <p>Scroll forward to begin exploring.</p>
                  )}
                  {activeIndex === 1 && (
                    <details>
                      <summary>Browse all portraits</summary>
                      <div className="museum3d-photo-list">
                        {photos.map((photo, index) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={(event) =>
                              openPhoto(photo, event.currentTarget)
                            }
                          >
                            <img src={photo.thumbnailSrc} alt="" loading="lazy" />
                            <span>
                              PLATE {String(index + 1).padStart(2, "0")}
                              {photo.caption && ` · ${photo.caption}`}
                              {photo.date && ` · ${photo.date}`} · {photo.alt}
                            </span>
                          </button>
                        ))}
                      </div>
                    </details>
                  )}
                  {activeIndex === 2 && (
                    <div className="museum3d-name-list" aria-label="Nickname archive">
                      {nicknames.map((name, index) => {
                        const marked = markedNames.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            aria-pressed={marked}
                            onClick={() => toggleName(name)}
                          >
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            {name}
                            <Heart
                              size={13}
                              fill={marked ? "currentColor" : "none"}
                              aria-hidden="true"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {activeIndex === 3 && (
                    <button
                      type="button"
                      className="museum3d-panel-action"
                      onClick={() => setLetterOpen(true)}
                    >
                      Open the letter
                    </button>
                  )}
                  {activeIndex === 4 && (
                    <p>
                      Happy Birthday Siya. Some collections are never complete; this
                      one will keep growing.
                    </p>
                  )}
                  </div>
                </div>
              </aside>

              <div className="museum3d-controls" aria-hidden="true">
                <p className="museum3d-control-hint">
                  Scroll to explore <ArrowDown size={14} />
                </p>
              </div>
            </div>
            <div className="museum3d-scroll-markers" aria-hidden="true">
              {exhibits.map((exhibit) => (
                <div key={exhibit.id} />
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="shell-footer">
        <span>THE MUSEUM OF HER</span>
        <span>A PRIVATE DIGITAL EXHIBITION <span className="footer-heart">♥</span></span>
      </footer>

      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          index={photos.findIndex((photo) => photo.id === selectedPhoto.id)}
          total={photos.length}
          onClose={closePhoto}
          onPrevious={() => changePhoto(-1)}
          onNext={() => changePhoto(1)}
        />
      )}

      <dialog
        className="museum3d-letter-dialog"
        ref={letterDialogRef}
        aria-labelledby="museum3d-letter-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setLetterOpen(false);
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          setLetterOpen(false);
        }}
        onClose={() => setLetterOpen(false)}
        onScroll={handleLetterDialogScroll}
      >
        <div className="museum3d-letter-ornament" aria-hidden="true">
          <Flower2 size={23} />
          <Heart size={16} fill="currentColor" />
          <Flower2 size={23} />
        </div>
        <form method="dialog">
          <button type="submit" className="museum3d-dialog-close">
            Close letter
          </button>
        </form>
        <span className="museum3d-kicker">PRIVATE CORRESPONDENCE</span>
        <h2 id="museum3d-letter-title">A letter for her</h2>
        <p>{birthdayLetter.trim() || letterPlaceholder}</p>
        {letterCanContinue ? (
          <button
            type="button"
            className="museum3d-letter-continue-action"
            onClick={continueToCake}
          >
            Continue to the birthday cake
          </button>
        ) : (
          <p className="museum3d-letter-continue">
            Scroll through the letter to continue to the birthday cake.
          </p>
        )}
        <div
          className="museum3d-letter-ornament museum3d-letter-ornament-bottom"
          aria-hidden="true"
        >
          <Flower2 size={17} />
          <Heart size={13} fill="currentColor" />
          <Flower2 size={17} />
        </div>
      </dialog>
    </main>
  );
}
