import { ArrowLeft, ArrowRight } from "lucide-react";
import { exhibits } from "../data/exhibits";
import AudioController from "./AudioController";

type ExhibitNavigationProps = {
  activeIndex: number;
  onNavigate: (index: number) => void;
};

export default function ExhibitNavigation({
  activeIndex,
  onNavigate,
}: ExhibitNavigationProps) {
  const progress = ((activeIndex + 1) / exhibits.length) * 100;

  return (
    <nav className="exhibit-navigation" aria-label="Exhibition rooms">
      <div className="nav-room-list">
        {exhibits.map((exhibit, index) => (
          <button
            key={exhibit.id}
            className="nav-room"
            type="button"
            onClick={() => onNavigate(index)}
            title={exhibit.name}
            aria-current={activeIndex === index ? "step" : undefined}
          >
            <span className="nav-room-number">{exhibit.number}</span>
            <span className="nav-room-name">{exhibit.name}</span>
          </button>
        ))}
      </div>

      <div className="nav-controls">
        <div className="nav-progress">
          <button
            type="button"
            className="nav-step"
            onClick={() => onNavigate(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous room"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
          </button>
          <div
            className="progress-track"
            role="progressbar"
            aria-label={`Exhibition progress: room ${activeIndex + 1} of ${exhibits.length}`}
            aria-valuemin={1}
            aria-valuemax={exhibits.length}
            aria-valuenow={activeIndex + 1}
          >
            <span className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-count">
            {String(activeIndex + 1).padStart(2, "0")} <span>/</span>{" "}
            {String(exhibits.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="nav-step"
            onClick={() => onNavigate(Math.min(exhibits.length - 1, activeIndex + 1))}
            disabled={activeIndex === exhibits.length - 1}
            aria-label="Next room"
          >
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>
        <AudioController />
      </div>
    </nav>
  );
}
