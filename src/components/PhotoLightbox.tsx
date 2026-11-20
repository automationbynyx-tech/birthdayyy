import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { MuseumPhoto } from "../data/photos";

type PhotoLightboxProps = {
  photo: MuseumPhoto;
  index: number;
  total: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export default function PhotoLightbox({
  photo,
  index,
  total,
  onClose,
  onPrevious,
  onNext,
}: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();

      if (event.key === "Tab") {
        const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
          "button:not([disabled])",
        );
        if (!buttons?.length) return;

        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, onNext, onPrevious]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Portrait ${index + 1} of ${total}`}
      ref={dialogRef}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        className="lightbox-close"
        type="button"
        onClick={onClose}
        ref={closeButtonRef}
        aria-label="Close portrait"
      >
        <X size={20} />
      </button>
      <button
        className="lightbox-arrow lightbox-prev"
        type="button"
        onClick={onPrevious}
        aria-label="Previous portrait"
      >
        <ArrowLeft size={20} />
      </button>
      <figure className="lightbox-figure">
        <div className="lightbox-image">
          <img src={photo.src} alt={photo.alt} decoding="async" />
        </div>
        <figcaption>
          <span>{`PLATE ${String(index + 1).padStart(2, "0")}`}</span>
          {photo.caption && <span>{photo.caption}</span>}
          {photo.date && <span>{photo.date}</span>}
        </figcaption>
      </figure>
      <button
        className="lightbox-arrow lightbox-next"
        type="button"
        onClick={onNext}
        aria-label="Next portrait"
      >
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
