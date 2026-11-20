import { Heart } from "lucide-react";
import { useCallback, useState } from "react";
import { photos } from "../data/photos";
import PhotoLightbox from "./PhotoLightbox";

export default function PortraitCollection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    requestAnimationFrame(() => trigger?.focus());
  }, [trigger]);

  const previousPhoto = useCallback(() => {
    setSelectedIndex((current) =>
      current === null ? null : (current - 1 + photos.length) % photos.length,
    );
  }, []);

  const nextPhoto = useCallback(() => {
    setSelectedIndex((current) =>
      current === null ? null : (current + 1) % photos.length,
    );
  }, []);

  return (
    <>
      <div className="portrait-grid" aria-label="Portrait collection">
        {photos.map((photo, index) => (
          <button
            type="button"
            className={`portrait-card portrait-card-${(index % 8) + 1}`}
            key={photo.id}
            onClick={(event) => {
              setTrigger(event.currentTarget);
              setSelectedIndex(index);
            }}
            aria-haspopup="dialog"
          >
            <span className="portrait-frame">
              <img
                src={photo.thumbnailSrc}
                srcSet={photo.srcSet}
                sizes="(max-width: 760px) 45vw, (max-width: 1120px) 22vw, 18vw"
                alt={photo.alt}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="portrait-meta">
              <span>{`PLATE ${String(index + 1).padStart(2, "0")}`}</span>
              {photo.caption && <span className="portrait-caption">{photo.caption}</span>}
              <Heart size={13} strokeWidth={1.3} aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>
      <p className="collection-note">
        Captions and dates can be added when their mappings are confirmed.
      </p>
      {selectedIndex !== null && (
        <PhotoLightbox
          photo={photos[selectedIndex]}
          index={selectedIndex}
          total={photos.length}
          onClose={closeLightbox}
          onPrevious={previousPhoto}
          onNext={nextPhoto}
        />
      )}
    </>
  );
}
