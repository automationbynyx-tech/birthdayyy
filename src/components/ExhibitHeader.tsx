import type { ReactNode } from "react";
import { Heart } from "lucide-react";

type ExhibitHeaderProps = {
  number: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  level?: 1 | 2;
};

export default function ExhibitHeader({
  number,
  eyebrow,
  title,
  description,
  level = 2,
}: ExhibitHeaderProps) {
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <header className="exhibit-heading">
      <div className="exhibit-index">
        <span>{number}</span>
        <span className="index-rule" aria-hidden="true" />
        <span>{eyebrow}</span>
        <Heart className="index-heart" size={9} aria-hidden="true" />
      </div>
      <Heading>{title}</Heading>
      <p>{description}</p>
    </header>
  );
}
