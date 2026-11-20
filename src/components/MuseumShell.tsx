import { ArrowDown, ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { exhibits } from "../data/exhibits";
import { BotanicalSprig, FloatingPetals } from "./ArtMotifs";
import BirthdayLetter from "./BirthdayLetter";
import ExhibitHeader from "./ExhibitHeader";
import ExhibitNavigation from "./ExhibitNavigation";
import InfiniteCollection from "./InfiniteCollection";
import NicknameArchive from "./NicknameArchive";
import PortraitCollection from "./PortraitCollection";

export default function MuseumShell() {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const navigateTo = (index: number) => {
    const target = document.getElementById(exhibits[index].id);
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    setActiveIndex(index);
  };

  useEffect(() => {
    const sections = exhibits
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        const nextIndex = exhibits.findIndex(({ id }) => id === visible.target.id);
        if (nextIndex !== -1) setActiveIndex(nextIndex);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="museum-shell">
      <header className="shell-header">
        <a
          className="wordmark"
          href="#entrance"
          onClick={(event) => {
            event.preventDefault();
            navigateTo(0);
          }}
          aria-label="The Museum of Her, return to entrance"
        >
          <span className="wordmark-seal" aria-hidden="true">
            <Heart size={13} strokeWidth={1.4} />
          </span>
          <span>
            The Museum <i>of Her</i>
          </span>
        </a>
        <span className="header-note">A private collection</span>
        <ExhibitNavigation activeIndex={activeIndex} onNavigate={navigateTo} />
      </header>

      <div className="shell-main">
        <section className="entrance-section exhibit-section" id="entrance">
          <FloatingPetals className="entrance-petals" />
          <motion.div
            className="entrance-layout"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.65,
              ease: [0.22, 0.61, 0.36, 1],
            }}
          >
            <div className="entrance-copy">
              <ExhibitHeader
                number={exhibits[0].number}
                eyebrow="The Entrance"
                level={1}
                title={
                  <>
                    The Museum
                    <br />
                    <i>of Her</i>
                  </>
                }
                description="A private digital exhibition. A personal archive, thoughtfully taking shape."
              />
              <button
                className="enter-button"
                type="button"
                onClick={() => navigateTo(1)}
              >
                <span>Enter the museum</span>
                <ArrowDown size={15} strokeWidth={1.5} />
              </button>
              <p className="entrance-note">
                Five rooms. One collection that keeps growing.
              </p>
            </div>

            <div className="entrance-art" aria-hidden="true">
              <BotanicalSprig className="entrance-botanical" />
              <span className="entrance-orbit orbit-outer" />
              <span className="entrance-orbit orbit-middle" />
              <span className="entrance-orbit orbit-inner" />
              <span className="entrance-art-mark">
                <Heart size={37} strokeWidth={0.9} />
              </span>
              <span className="entrance-art-caption">A PRIVATE COLLECTION</span>
            </div>
          </motion.div>
        </section>

        {exhibits.slice(1).map((exhibit, index) => {
          const exhibitIndex = index + 1;
          return (
            <section
              className={`exhibit-section room-section room-section-${exhibit.id}`}
              id={exhibit.id}
              key={exhibit.id}
            >
              <BotanicalSprig className="room-botanical" />
              <motion.div
                className="room-content"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.55,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              >
                <ExhibitHeader
                  number={exhibit.number}
                  eyebrow={exhibit.name}
                  title={exhibit.title}
                  description={exhibit.description}
                />
                <div className={`room-body room-body-${exhibit.id}`}>
                  {exhibit.id === "portraits" && <PortraitCollection />}
                  {exhibit.id === "names" && <NicknameArchive />}
                  {exhibit.id === "letter" && <BirthdayLetter />}
                  {exhibit.id === "infinite" && <InfiniteCollection />}
                </div>
                <div className="room-controls">
                  <button
                    type="button"
                    className="room-control"
                    onClick={() => navigateTo(exhibitIndex - 1)}
                  >
                    <ArrowLeft size={14} strokeWidth={1.5} />
                    <span>Previous room</span>
                  </button>
                  {exhibitIndex < exhibits.length - 1 ? (
                    <button
                      type="button"
                      className="room-control"
                      onClick={() => navigateTo(exhibitIndex + 1)}
                    >
                      <span>Next room</span>
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="room-control"
                      onClick={() => navigateTo(0)}
                    >
                      <span>Return to entrance</span>
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </motion.div>
            </section>
          );
        })}
      </div>

      <footer className="shell-footer">
        <span>THE MUSEUM OF HER</span>
        <span>A PRIVATE DIGITAL EXHIBITION <span className="footer-heart">♥</span></span>
      </footer>
    </main>
  );
}
