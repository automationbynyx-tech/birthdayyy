export type Exhibit = {
  id: string;
  number: string;
  name: string;
  title: string;
  description: string;
};

export const exhibits: Exhibit[] = [
  {
    id: "entrance",
    number: "00",
    name: "The Entrance",
    title: "The Museum of Her",
    description:
      "A private digital exhibition. A personal archive, thoughtfully taking shape.",
  },
  {
    id: "portraits",
    number: "01",
    name: "Portraits",
    title: "The Portrait Collection",
    description: "A curated collection of portraits and moments.",
  },
  {
    id: "names",
    number: "02",
    name: "Her Names",
    title: "The Many Names of Her",
    description: "Ten names from her own little constellation.",
  },
  {
    id: "letter",
    number: "03",
    name: "A Letter",
    title: "The Things Words Cannot Exhibit",
    description: "A place for a letter in the owner's own words.",
  },
  {
    id: "infinite",
    number: "04",
    name: "Forever",
    title: "The Infinite Collection",
    description: "A birthday wish, and room for everything yet to come.",
  },
];
