import { Heart } from "lucide-react";
import { useState } from "react";
import { birthdayLetter, letterPlaceholder } from "../data/letter";

export default function BirthdayLetter() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`birthday-letter${open ? " is-open" : ""}`}>
      <div className="letter-paper">
        <div className="letter-meta">
          <span>PRIVATE CORRESPONDENCE</span>
          <span>21 · XI · MMXXVI</span>
        </div>
        <button
          type="button"
          className="letter-seal"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="birthday-letter-copy"
          aria-label={open ? "Close the letter" : "Open the letter"}
        >
          <svg className="letter-seal-shape" viewBox="0 0 56 52" aria-hidden="true">
            <path d="M28 49C23 44 4 32 4 18 4 9 10 4 18 4c5 0 8 3 10 8 2-5 6-8 11-8 8 0 13 5 13 14 0 14-19 26-24 31Z" />
            <path d="M28 45C21 39 8 29 8 18c0-7 4-10 10-10 5 0 8 4 10 8 2-4 5-8 11-8 6 0 9 4 9 10 0 11-13 21-20 27Z" />
          </svg>
          <Heart size={20} fill="currentColor" strokeWidth={1} />
        </button>
        <div
          className="letter-copy"
          id="birthday-letter-copy"
          hidden={!open}
        >
          <p>
            {birthdayLetter.trim() || letterPlaceholder}
          </p>
        </div>
        {!open && (
          <p className="letter-invitation">A letter is waiting<br />to be opened.</p>
        )}
        <span className="letter-flourish" aria-hidden="true">✳</span>
      </div>
      {!open && <p className="letter-caption">Press the seal to open</p>}
    </div>
  );
}
