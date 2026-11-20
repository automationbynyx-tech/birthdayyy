import { Heart } from "lucide-react";
import { useState } from "react";
import { nicknames } from "../data/nicknames";

export default function NicknameArchive() {
  const [markedNames, setMarkedNames] = useState<string[]>([]);

  const toggleMarkedName = (name: string) => {
    setMarkedNames((current) =>
      current.includes(name)
        ? current.filter((markedName) => markedName !== name)
        : [...current, name],
    );
  };

  return (
    <div className="nickname-collection">
      <div className="nickname-grid" aria-label="Nickname archive">
        {nicknames.map((name, index) => {
          const marked = markedNames.includes(name);
          return (
            <button
              key={name}
              type="button"
              className={`nickname-card${marked ? " is-marked" : ""}`}
              onClick={() => toggleMarkedName(name)}
              aria-pressed={marked}
            >
              <span className="nickname-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="nickname-name">{name}</span>
              <Heart
                className="nickname-heart"
                size={15}
                fill={marked ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      <p className="nickname-note">
        Tap a name to leave a heart beside it. Their meanings belong to her.
      </p>
    </div>
  );
}
