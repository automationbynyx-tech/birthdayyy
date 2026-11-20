import portrait01 from "../../assets/portrait-01.webp";
import portrait01Thumb from "../../assets/portrait-01-thumb.webp";
import portrait02 from "../../assets/portrait-02.webp";
import portrait02Thumb from "../../assets/portrait-02-thumb.webp";
import portrait03 from "../../assets/portrait-03.webp";
import portrait03Thumb from "../../assets/portrait-03-thumb.webp";
import portrait04 from "../../assets/portrait-04.webp";
import portrait04Thumb from "../../assets/portrait-04-thumb.webp";
import portrait05 from "../../assets/portrait-05.webp";
import portrait05Thumb from "../../assets/portrait-05-thumb.webp";
import portrait06 from "../../assets/portrait-06.webp";
import portrait06Thumb from "../../assets/portrait-06-thumb.webp";
import portrait07 from "../../assets/portrait-07.webp";
import portrait07Thumb from "../../assets/portrait-07-thumb.webp";
import portrait08 from "../../assets/portrait-08.webp";
import portrait08Thumb from "../../assets/portrait-08-thumb.webp";
import portrait09 from "../../assets/portrait-09.webp";
import portrait09Thumb from "../../assets/portrait-09-thumb.webp";
import portrait10 from "../../assets/portrait-10.webp";
import portrait10Thumb from "../../assets/portrait-10-thumb.webp";
import portrait11 from "../../assets/portrait-11.webp";
import portrait11Thumb from "../../assets/portrait-11-thumb.webp";
import portrait12 from "../../assets/portrait-12.webp";
import portrait12Thumb from "../../assets/portrait-12-thumb.webp";
import portrait13 from "../../assets/portrait-13.webp";
import portrait13Thumb from "../../assets/portrait-13-thumb.webp";
import portrait14 from "../../assets/portrait-14.webp";
import portrait14Thumb from "../../assets/portrait-14-thumb.webp";
import portrait15 from "../../assets/portrait-15.webp";
import portrait15Thumb from "../../assets/portrait-15-thumb.webp";
import portrait16 from "../../assets/portrait-16.webp";
import portrait16Thumb from "../../assets/portrait-16-thumb.webp";
import portrait17 from "../../assets/portrait-17.webp";
import portrait17Thumb from "../../assets/portrait-17-thumb.webp";
import portrait18 from "../../assets/portrait-18.webp";
import portrait18Thumb from "../../assets/portrait-18-thumb.webp";
import portrait19 from "../../assets/portrait-19.webp";
import portrait19Thumb from "../../assets/portrait-19-thumb.webp";
import portrait20 from "../../assets/portrait-20.webp";
import portrait20Thumb from "../../assets/portrait-20-thumb.webp";
import portrait21 from "../../assets/portrait-21.webp";
import portrait21Thumb from "../../assets/portrait-21-thumb.webp";
import portrait22 from "../../assets/portrait-22.webp";
import portrait22Thumb from "../../assets/portrait-22-thumb.webp";
import portrait23 from "../../assets/portrait-23.webp";
import portrait23Thumb from "../../assets/portrait-23-thumb.webp";
import portrait24 from "../../assets/portrait-24.webp";
import portrait24Thumb from "../../assets/portrait-24-thumb.webp";
import portrait25 from "../../assets/portrait-25.webp";
import portrait25Thumb from "../../assets/portrait-25-thumb.webp";
import portrait26 from "../../assets/portrait-26.webp";
import portrait26Thumb from "../../assets/portrait-26-thumb.webp";

export type MuseumPhoto = {
  id: string;
  src: string;
  thumbnailSrc: string;
  srcSet: string;
  alt: string;
  caption?: string;
  exhibit: "portraits" | "memories";
  date?: string;
  featured?: boolean;
  sortOrder: number;
};

const photoManifest: MuseumPhoto[] = [
  {
    id: "portrait-01",
    src: portrait01,
    thumbnailSrc: portrait01Thumb,
    srcSet: `${portrait01Thumb} 720w, ${portrait01} 1800w`,
    alt: "Two people seated together indoors",
    caption: "First Date",
    exhibit: "portraits",
    date: "19/10/2026",
    featured: true,
    sortOrder: 1,
  },
  {
    id: "portrait-02",
    src: portrait02,
    thumbnailSrc: portrait02Thumb,
    srcSet: `${portrait02Thumb} 542w, ${portrait02} 1355w`,
    alt: "Close-up portrait wearing glasses",
    exhibit: "portraits",
    featured: true,
    sortOrder: 2,
  },
  {
    id: "portrait-03",
    src: portrait03,
    thumbnailSrc: portrait03Thumb,
    srcSet: `${portrait03Thumb} 542w, ${portrait03} 1204w`,
    alt: "Two people seated together in a car",
    exhibit: "portraits",
    sortOrder: 3,
  },
  {
    id: "portrait-04",
    src: portrait04,
    thumbnailSrc: portrait04Thumb,
    srcSet: `${portrait04Thumb} 540w, ${portrait04} 960w`,
    alt: "Full-length portrait in a floral outfit",
    exhibit: "portraits",
    sortOrder: 4,
  },
  {
    id: "portrait-05",
    src: portrait05,
    thumbnailSrc: portrait05Thumb,
    srcSet: `${portrait05Thumb} 540w, ${portrait05} 1350w`,
    alt: "Portrait seated in an orange chair wearing an embroidered outfit",
    caption: "Boss Lady",
    exhibit: "portraits",
    featured: true,
    sortOrder: 5,
  },
  {
    id: "portrait-06",
    src: portrait06,
    thumbnailSrc: portrait06Thumb,
    srcSet: `${portrait06Thumb} 720w, ${portrait06} 1800w`,
    alt: "Close-up portrait in a floral outfit",
    exhibit: "portraits",
    sortOrder: 6,
  },
  {
    id: "portrait-07",
    src: portrait07,
    thumbnailSrc: portrait07Thumb,
    srcSet: `${portrait07Thumb} 720w, ${portrait07} 1434w`,
    alt: "Self-portrait in warm light",
    exhibit: "portraits",
    sortOrder: 7,
  },
  {
    id: "portrait-08",
    src: portrait08,
    thumbnailSrc: portrait08Thumb,
    srcSet: `${portrait08Thumb} 410w`,
    alt: "Childhood portrait in a colorful outfit",
    exhibit: "memories",
    sortOrder: 8,
  },
  {
    id: "portrait-09",
    src: portrait09,
    thumbnailSrc: portrait09Thumb,
    srcSet: `${portrait09Thumb} 540w, ${portrait09} 720w`,
    alt: "Portrait in front of a historic building",
    exhibit: "memories",
    sortOrder: 9,
  },
  {
    id: "portrait-10",
    src: portrait10,
    thumbnailSrc: portrait10Thumb,
    srcSet: `${portrait10Thumb} 406w, ${portrait10} 900w`,
    alt: "Full-length mirror portrait in a dark outfit",
    exhibit: "portraits",
    sortOrder: 10,
  },
  {
    id: "portrait-11",
    src: portrait11,
    thumbnailSrc: portrait11Thumb,
    srcSet: `${portrait11Thumb} 720w, ${portrait11} 1195w`,
    alt: "Portrait at a shop counter",
    exhibit: "memories",
    sortOrder: 11,
  },
  {
    id: "portrait-12",
    src: portrait12,
    thumbnailSrc: portrait12Thumb,
    srcSet: `${portrait12Thumb} 720w, ${portrait12} 1600w`,
    alt: "Close-up portrait with earrings",
    exhibit: "portraits",
    sortOrder: 12,
  },
  {
    id: "portrait-13",
    src: portrait13,
    thumbnailSrc: portrait13Thumb,
    srcSet: `${portrait13Thumb} 330w, ${portrait13} 732w`,
    alt: "Selfie in an embroidered outfit with a video-call inset",
    caption: "Diwali with laxmi",
    exhibit: "portraits",
    date: "20/10/2025",
    sortOrder: 13,
  },
  {
    id: "portrait-14",
    src: portrait14,
    thumbnailSrc: portrait14Thumb,
    srcSet: `${portrait14Thumb} 540w, ${portrait14} 1350w`,
    alt: "Full-length portrait outdoors at night",
    exhibit: "memories",
    sortOrder: 14,
  },
  {
    id: "portrait-15",
    src: portrait15,
    thumbnailSrc: portrait15Thumb,
    srcSet: `${portrait15Thumb} 540w, ${portrait15} 1350w`,
    alt: "Portrait in front of a mirror",
    exhibit: "portraits",
    sortOrder: 15,
  },
  {
    id: "portrait-16",
    src: portrait16,
    thumbnailSrc: portrait16Thumb,
    srcSet: `${portrait16Thumb} 479w, ${portrait16} 1080w`,
    alt: "Baby portrait in a white lace outfit and headband",
    caption: "Bachu",
    exhibit: "memories",
    sortOrder: 16,
  },
  {
    id: "portrait-17",
    src: portrait17,
    thumbnailSrc: portrait17Thumb,
    srcSet: `${portrait17Thumb} 405w, ${portrait17} 900w`,
    alt: "Full-length mirror portrait in an orange outfit",
    exhibit: "portraits",
    sortOrder: 17,
  },
  {
    id: "portrait-18",
    src: portrait18,
    thumbnailSrc: portrait18Thumb,
    srcSet: `${portrait18Thumb} 720w, ${portrait18} 960w`,
    alt: "Mirror portrait in a floral outfit",
    exhibit: "portraits",
    sortOrder: 18,
  },
  {
    id: "portrait-19",
    src: portrait19,
    thumbnailSrc: portrait19Thumb,
    srcSet: `${portrait19Thumb} 405w, ${portrait19} 900w`,
    alt: "Two hands resting together",
    caption: "Relationship starting date",
    exhibit: "memories",
    date: "05/09/2026",
    sortOrder: 19,
  },
  {
    id: "portrait-20",
    src: portrait20,
    thumbnailSrc: portrait20Thumb,
    srcSet: `${portrait20Thumb} 540w, ${portrait20} 1350w`,
    alt: "People gathered outdoors beneath string lights",
    exhibit: "memories",
    sortOrder: 20,
  },
  {
    id: "portrait-21",
    src: portrait21,
    thumbnailSrc: portrait21Thumb,
    srcSet: `${portrait21Thumb} 384w, ${portrait21} 768w`,
    alt: "Mirror selfie dated May 22, 2025",
    caption: "Hand Fracture Day",
    exhibit: "portraits",
    date: "22/05/2025",
    featured: true,
    sortOrder: 21,
  },
  {
    id: "portrait-22",
    src: portrait22,
    thumbnailSrc: portrait22Thumb,
    srcSet: `${portrait22Thumb} 384w, ${portrait22} 768w`,
    alt: "A video call displayed on a laptop screen",
    exhibit: "memories",
    sortOrder: 22,
  },
  {
    id: "portrait-23",
    src: portrait23,
    thumbnailSrc: portrait23Thumb,
    srcSet: `${portrait23Thumb} 384w, ${portrait23} 768w`,
    alt: "Mirror selfie in a dark outfit",
    exhibit: "memories",
    sortOrder: 23,
  },
  {
    id: "portrait-24",
    src: portrait24,
    thumbnailSrc: portrait24Thumb,
    srcSet: `${portrait24Thumb} 384w, ${portrait24} 768w`,
    alt: "Mirror selfie in a white shirt",
    exhibit: "memories",
    sortOrder: 24,
  },
  {
    id: "portrait-25",
    src: portrait25,
    thumbnailSrc: portrait25Thumb,
    srcSet: `${portrait25Thumb} 360w, ${portrait25} 720w`,
    alt: "Close-up selfie with a heart frame",
    exhibit: "memories",
    sortOrder: 25,
  },
  {
    id: "portrait-26",
    src: portrait26,
    thumbnailSrc: portrait26Thumb,
    srcSet: `${portrait26Thumb} 360w, ${portrait26} 720w`,
    alt: "Mirror selfie in an orange outfit",
    exhibit: "memories",
    sortOrder: 26,
  },
];

export const photos = [...photoManifest].sort((a, b) => a.sortOrder - b.sortOrder);
