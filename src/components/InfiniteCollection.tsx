import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { BotanicalSprig, FloatingPetals } from "./ArtMotifs";

export default function InfiniteCollection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="infinite-collection">
      <FloatingPetals className="finale-petals" />
      <BotanicalSprig className="finale-botanical finale-botanical-left" />
      <BotanicalSprig className="finale-botanical finale-botanical-right" />
      <motion.div
        className="infinite-heart-art"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.1, ease: [0.22, 0.61, 0.36, 1] }}
        aria-hidden="true"
      >
        <span className="heart-orbit heart-orbit-one" />
        <span className="heart-orbit heart-orbit-two" />
        <span className="heart-orbit heart-orbit-three" />
        <Heart className="infinite-heart-glow" size={104} fill="currentColor" strokeWidth={0.4} />
        <Heart className="infinite-heart" size={92} strokeWidth={0.8} />
        <span className="heart-spark heart-spark-one">✳</span>
        <span className="heart-spark heart-spark-two">✧</span>
        <span className="heart-spark heart-spark-three">✳</span>
      </motion.div>
      <p className="birthday-greeting">Happy <i>Birthday Siya</i></p>
      <time className="birthday-date" dateTime="2026-11-21">21 November 2026</time>
      <span className="finale-rule" aria-hidden="true" />
      <p className="finale-closing">
        Some collections are never complete.
        <br />
        <i>This one will keep growing.</i>
      </p>
    </div>
  );
}
