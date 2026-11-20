import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  CatmullRomCurve3,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  SRGBColorSpace,
  Shape,
  SphereGeometry,
  TextureLoader,
  TubeGeometry,
  Vector3,
} from "three";
import { exhibits } from "../data/exhibits";
import { nicknames } from "../data/nicknames";
import {
  LETTER_SCROLL_START_WEIGHT,
  ROOM_SCROLL_WEIGHTS,
  TOTAL_ROOM_SCROLL_WEIGHT,
} from "../data/museumScroll";
import { photos, type MuseumPhoto } from "../data/photos";

const ROOM_DEPTH = 18;
const ROOM_WIDTH = 14;
const ROOM_HEIGHT = 4.8;
const PORTRAIT_CENTER_Z = -ROOM_DEPTH;
const PORTRAIT_FRAME_X = -ROOM_WIDTH / 2 + 0.5;
const RELATIONSHIP_FRAME_Z = PORTRAIT_CENTER_Z + 7.8;
const FIRST_DATE_FRAME_Z = PORTRAIT_CENTER_Z + 4.7;
const HAND_FRACTURE_FRAME_Z = PORTRAIT_CENTER_Z + 1.6;
const DIWALI_FRAME_Z = PORTRAIT_CENTER_Z - 1.5;
const BACHU_FRAME_Z = PORTRAIT_CENTER_Z - 4.6;
const BOSS_LADY_FRAME_Z = PORTRAIT_CENTER_Z - 7.7;
const PORTRAIT_EXIT_GATE_Z = -ROOM_DEPTH - ROOM_DEPTH / 2;
const PORTRAIT_GATE_CLEAR_Z = PORTRAIT_EXIT_GATE_Z - 0.4;
const NAMES_GATE_SIGN_Z = PORTRAIT_EXIT_GATE_Z + 0.28;
const NAMES_GATE_SIGN_Y = 3.16;
const NICKNAME_WALL_X = ROOM_WIDTH / 2 - 0.21;
const NICKNAME_LABEL_Y = 2.55;
const NICKNAME_PRIMARY_FRAME_Y = 1.35;
const NICKNAME_SECONDARY_FRAME_Y = 3.75;
const FIRST_NICKNAME_Z = -2 * ROOM_DEPTH + 7;
const NICKNAME_SPACING = 14 / Math.max(1, nicknames.length - 1);
const LAST_NICKNAME_Z =
  FIRST_NICKNAME_Z - (nicknames.length - 1) * NICKNAME_SPACING;
const NICKNAME_FOLLOWUP_INITIAL_GAP = 1.3;
const NICKNAME_FOLLOWUP_FRAME_SPACING = 1.15;
const LETTER_UNFOLD_DURATION = 0.18;
const ROOM_PROGRESS_EPSILON = 0.0001;
const PORTRAIT_WALL_PHOTO_IDS = new Set([
  "portrait-01",
  "portrait-21",
  "portrait-05",
  "portrait-13",
  "portrait-16",
  "portrait-19",
]);
const NICKNAME_FOLLOWUP_PHOTO_IDS = new Set([
  "portrait-22",
  "portrait-23",
  "portrait-24",
  "portrait-25",
  "portrait-26",
]);
const NICKNAME_FOLLOWUP_PHOTOS = photos.filter((photo) =>
  NICKNAME_FOLLOWUP_PHOTO_IDS.has(photo.id),
);
const NICKNAME_GALLERY_PHOTOS = photos.filter(
  (photo) =>
    !PORTRAIT_WALL_PHOTO_IDS.has(photo.id) &&
    !NICKNAME_FOLLOWUP_PHOTO_IDS.has(photo.id),
);
const NICKNAME_PHOTO_GROUP_SWAPS = new Map([
  ["Tbw", "Siyu"],
  ["Siyu", "Tbw"],
]);
const NICKNAME_PHOTO_GROUPS = nicknames.map((name, nameIndex) => {
  const sourceGroupIndex = nicknames.indexOf(
    NICKNAME_PHOTO_GROUP_SWAPS.get(name) ?? name,
  );
  return {
    name,
    photos: NICKNAME_GALLERY_PHOTOS.filter((_, photoIndex) => {
      const assignedNameIndex =
        photoIndex < nicknames.length
          ? photoIndex
          : ((photoIndex - nicknames.length) * 2) % nicknames.length;
      return assignedNameIndex === sourceGroupIndex || (
        sourceGroupIndex < 0 && assignedNameIndex === nameIndex
      );
    }),
  };
});
const tbwPhotoGroup = NICKNAME_PHOTO_GROUPS.find(({ name }) => name === "Tbw");
const babuPhotoGroup = NICKNAME_PHOTO_GROUPS.find(({ name }) => name === "Babu");
if (!tbwPhotoGroup || !babuPhotoGroup) {
  throw new Error("Missing Tbw or Babu nickname photo group.");
}
const tbwUpperPhotoIndex = tbwPhotoGroup.photos.findIndex(
  ({ id }) => id === "portrait-18",
);
const babuPhotoIndex = babuPhotoGroup.photos.findIndex(
  ({ id }) => id === "portrait-12",
);
if (tbwUpperPhotoIndex < 0 || babuPhotoIndex < 0) {
  throw new Error("Missing photo for the Tbw and Babu nickname swap.");
}
[
  tbwPhotoGroup.photos[tbwUpperPhotoIndex],
  babuPhotoGroup.photos[babuPhotoIndex],
] = [
  babuPhotoGroup.photos[babuPhotoIndex],
  tbwPhotoGroup.photos[tbwUpperPhotoIndex],
];
const baidiPhotoGroup = NICKNAME_PHOTO_GROUPS.find(
  ({ name }) => name === "Baidi",
);
if (!baidiPhotoGroup) {
  throw new Error("Missing Baidi nickname photo group.");
}
const baidiPhotoIndex = baidiPhotoGroup.photos.findIndex(
  ({ id }) => id === "portrait-03",
);
const babuCurrentPhotoIndex = babuPhotoGroup.photos.findIndex(
  ({ id }) => id === "portrait-18",
);
if (baidiPhotoIndex < 0 || babuCurrentPhotoIndex < 0) {
  throw new Error("Missing photo for the Baidi and Babu nickname swap.");
}
[
  baidiPhotoGroup.photos[baidiPhotoIndex],
  babuPhotoGroup.photos[babuCurrentPhotoIndex],
] = [
  babuPhotoGroup.photos[babuCurrentPhotoIndex],
  baidiPhotoGroup.photos[baidiPhotoIndex],
];
const CAMERA_X = [0, -2.6, 4.2, 0, 0];
const CAMERA_Y = [1.65, 1.65, 1.65, 4.1, 3.1];
const NICKNAME_FOLLOWUP_LAST_Z =
  LAST_NICKNAME_Z -
  NICKNAME_FOLLOWUP_INITIAL_GAP -
  (NICKNAME_FOLLOWUP_PHOTOS.length - 1) * NICKNAME_FOLLOWUP_FRAME_SPACING;
const CAMERA_Z = [3.5, -10.2, FIRST_NICKNAME_Z, NICKNAME_FOLLOWUP_LAST_Z - 0.1, -66];
type Point3 = [number, number, number];
type CameraWaypoint = {
  phase: number;
  position: [number, number];
  lookAt: Point3;
};

const LOOK_AT_X = [0, PORTRAIT_FRAME_X, NICKNAME_WALL_X, 0, 0];
const LOOK_AT_Y = [
  2.35,
  2.55,
  NICKNAME_PRIMARY_FRAME_Y,
  2.15,
  1.85,
];
const LOOK_AT_Z = [
  -8.5,
  RELATIONSHIP_FRAME_Z,
  FIRST_NICKNAME_Z,
  -55.5,
  -70,
];
const NICKNAME_FRAME_STOPS = NICKNAME_PHOTO_GROUPS.flatMap(
  ({ photos: namePhotos }, nameIndex) => {
    const nameZ = FIRST_NICKNAME_Z - nameIndex * NICKNAME_SPACING;
    return namePhotos.map((_, photoIndex) => ({
      nameZ,
      centerY:
        photoIndex === 0
          ? (NICKNAME_PRIMARY_FRAME_Y + NICKNAME_LABEL_Y) / 2
          : (NICKNAME_SECONDARY_FRAME_Y + NICKNAME_LABEL_Y) / 2,
    }));
  },
).concat(
  NICKNAME_FOLLOWUP_PHOTOS.map((_, index) => ({
    nameZ:
      LAST_NICKNAME_Z -
      NICKNAME_FOLLOWUP_INITIAL_GAP -
      index * NICKNAME_FOLLOWUP_FRAME_SPACING,
    centerY: NICKNAME_LABEL_Y,
  })),
);
const portraitFrameWaypoint = (
  phase: number,
  frameZ: number,
): CameraWaypoint => ({
  phase,
  position: [CAMERA_X[1], frameZ],
  lookAt: [PORTRAIT_FRAME_X, 2.55, frameZ],
});
// Repeated positions create centered pauses before each scroll transition.
const PORTRAIT_CAMERA_PATH: CameraWaypoint[] = [
  portraitFrameWaypoint(0, RELATIONSHIP_FRAME_Z),
  portraitFrameWaypoint(0.1, RELATIONSHIP_FRAME_Z),
  portraitFrameWaypoint(0.16, FIRST_DATE_FRAME_Z),
  portraitFrameWaypoint(0.22, FIRST_DATE_FRAME_Z),
  portraitFrameWaypoint(0.28, HAND_FRACTURE_FRAME_Z),
  portraitFrameWaypoint(0.34, HAND_FRACTURE_FRAME_Z),
  portraitFrameWaypoint(0.4, DIWALI_FRAME_Z),
  portraitFrameWaypoint(0.46, DIWALI_FRAME_Z),
  portraitFrameWaypoint(0.52, BACHU_FRAME_Z),
  portraitFrameWaypoint(0.58, BACHU_FRAME_Z),
  portraitFrameWaypoint(0.64, BOSS_LADY_FRAME_Z),
  portraitFrameWaypoint(0.72, BOSS_LADY_FRAME_Z),
  {
    phase: 0.86,
    position: [0, PORTRAIT_EXIT_GATE_Z + 4],
    lookAt: [0, NAMES_GATE_SIGN_Y, NAMES_GATE_SIGN_Z],
  },
  {
    phase: 0.92,
    position: [0, PORTRAIT_EXIT_GATE_Z + 4],
    lookAt: [0, NAMES_GATE_SIGN_Y, NAMES_GATE_SIGN_Z],
  },
  {
    phase: 1,
    position: [CAMERA_X[2], CAMERA_Z[2]],
    lookAt: [LOOK_AT_X[2], LOOK_AT_Y[2], LOOK_AT_Z[2]],
  },
];
const NICKNAME_FRAME_PHASE_END = 0.9;
const NICKNAME_CAMERA_PATH: CameraWaypoint[] = [
  ...NICKNAME_FRAME_STOPS.flatMap((stop, index) => {
    const phaseStart =
      (index / NICKNAME_FRAME_STOPS.length) * NICKNAME_FRAME_PHASE_END;
    const phaseHoldEnd =
      ((index + 0.5) / NICKNAME_FRAME_STOPS.length) *
      NICKNAME_FRAME_PHASE_END;
    const waypoint = {
      position: [CAMERA_X[2], stop.nameZ] as [number, number],
      lookAt: [NICKNAME_WALL_X, stop.centerY, stop.nameZ] as Point3,
    };
    return [
      { phase: phaseStart, ...waypoint },
      { phase: phaseHoldEnd, ...waypoint },
    ];
  }),
  {
    phase: 1,
    position: [CAMERA_X[3], CAMERA_Z[3]],
    lookAt: [LOOK_AT_X[3], LOOK_AT_Y[3], LOOK_AT_Z[3]],
  },
];

const CEILING_LIGHT_PATHS: Point3[][] = [-6, -2, 2, 6].map((z) => [
  [-6.2, ROOM_HEIGHT - 0.32, z],
  [-3.1, ROOM_HEIGHT - 0.62, z],
  [0, ROOM_HEIGHT - 0.78, z],
  [3.1, ROOM_HEIGHT - 0.62, z],
  [6.2, ROOM_HEIGHT - 0.32, z],
]);

const WALL_LIGHT_PATHS = [-1, 1].map((side) => ({
  side,
  points: [
    [side * (ROOM_WIDTH / 2 - 0.18), 3.55, -8.2],
    [side * (ROOM_WIDTH / 2 - 0.18), 4.08, -4.1],
    [side * (ROOM_WIDTH / 2 - 0.18), 3.72, 0],
    [side * (ROOM_WIDTH / 2 - 0.18), 4.08, 4.1],
    [side * (ROOM_WIDTH / 2 - 0.18), 3.55, 8.2],
  ] as Point3[],
}));

const GATE_LIGHT_PATH: Point3[] = [
  [-2.7, 0.25, 0.32],
  [-2.7, 4.35, 0.32],
  [0, 4.35, 0.32],
  [2.7, 4.35, 0.32],
  [2.7, 0.25, 0.32],
];

const HEART_LIGHT_PATH: Point3[] = [
  [0, 0.72, 0.28],
  [-0.34, 1.06, 0.28],
  [-0.72, 1.08, 0.28],
  [-0.98, 0.82, 0.28],
  [-1.04, 0.48, 0.28],
  [-0.96, 0.12, 0.28],
  [-0.67, -0.28, 0.28],
  [-0.31, -0.65, 0.28],
  [0, -0.98, 0.28],
  [0.31, -0.65, 0.28],
  [0.67, -0.28, 0.28],
  [0.96, 0.12, 0.28],
  [1.04, 0.48, 0.28],
  [0.98, 0.82, 0.28],
  [0.72, 1.08, 0.28],
  [0.34, 1.06, 0.28],
];

export type MuseumWorldProps = {
  scrollProgress: number;
  reducedMotion: boolean;
  markedNames: string[];
  onRoomChange: (index: number) => void;
  onSelectPhoto: (photo: MuseumPhoto) => void;
  onToggleName: (name: string) => void;
  onOpenLetter: () => void;
  onReady: () => void;
};

function createPlaqueTexture(
  title: string,
  subtitle = "",
  featuredLabel = false,
  prominentLabel = false,
  nicknameLabel = false,
) {
  const canvas = document.createElement("canvas");
  canvas.width = featuredLabel || prominentLabel ? 1382 : 768;
  canvas.height = 320;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create an exhibit label texture.");

  context.fillStyle = featuredLabel || nicknameLabel ? "#211317" : "#191719";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#d9b77e";
  if (nicknameLabel) context.strokeStyle = "#efce96";
  context.lineWidth = featuredLabel || prominentLabel ? 7 : nicknameLabel ? 7 : 5;
  const inset = featuredLabel || prominentLabel ? 18 : nicknameLabel ? 12 : 12;
  context.strokeRect(inset, inset, canvas.width - inset * 2, canvas.height - inset * 2);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle =
    featuredLabel || prominentLabel ? "#fff0d6" : nicknameLabel ? "#fff8e9" : "#f0e5d8";
  context.font = prominentLabel
    ? 'italic 600 148px "Cormorant Garamond", Georgia, serif'
    : featuredLabel
      ? 'italic 600 88px "Cormorant Garamond", Georgia, serif'
      : nicknameLabel
        ? 'italic 600 110px "Cormorant Garamond", Georgia, serif'
        : "48px Georgia, serif";
  if (prominentLabel || nicknameLabel) {
    context.shadowColor = "rgba(255, 221, 165, 0.42)";
    context.shadowBlur = nicknameLabel ? 8 : 10;
  }
  context.fillText(title, canvas.width / 2, prominentLabel ? 106 : subtitle ? 116 : 160, canvas.width - 120);
  context.shadowBlur = 0;

  if (subtitle) {
    context.fillStyle = "#eac99b";
    context.font = prominentLabel
      ? 'italic 600 82px "Cormorant Garamond", Georgia, serif'
      : featuredLabel
        ? 'italic 600 52px "Cormorant Garamond", Georgia, serif'
        : nicknameLabel
          ? 'italic 600 34px "Cormorant Garamond", Georgia, serif'
        : 'italic 600 24px "Cormorant Garamond", Georgia, serif';
    context.fillText(subtitle, canvas.width / 2, prominentLabel ? 239 : 228, canvas.width - 120);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function createHeartInscriptionTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 480;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create the heart inscription texture.");

  const gold = context.createLinearGradient(0, 90, 0, 390);
  gold.addColorStop(0, "#fff0ce");
  gold.addColorStop(0.52, "#e6c17e");
  gold.addColorStop(1, "#fff3d4");
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(255, 221, 165, 0.72)";
  context.shadowBlur = 18;
  context.fillStyle = gold;
  context.font = 'italic 600 108px "Cormorant Garamond", Georgia, serif';
  context.fillText("Happy Birthday", canvas.width / 2, 166, canvas.width - 96);
  context.font = 'italic 600 172px "Cormorant Garamond", Georgia, serif';
  context.fillText("Siya", canvas.width / 2, 318, canvas.width - 96);

  context.shadowBlur = 0;
  context.strokeStyle = "rgba(244, 215, 164, 0.88)";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(350, 423);
  context.quadraticCurveTo(canvas.width / 2, 442, 674, 423);
  context.stroke();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function HeartInscription({
  position,
}: {
  position: [number, number, number];
}) {
  const texture = useMemo(createHeartInscriptionTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={position}>
      <planeGeometry args={[1.92, 0.9]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function Plaque({
  title,
  subtitle,
  position,
  rotation,
  width = 2.2,
  height = 0.95,
  marked = false,
  featuredLabel = false,
  prominentLabel = false,
  nicknameLabel = false,
  onClick,
}: {
  title: string;
  subtitle?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  marked?: boolean;
  featuredLabel?: boolean;
  prominentLabel?: boolean;
  nicknameLabel?: boolean;
  onClick?: () => void;
}) {
  const texture = useMemo(
    () =>
      createPlaqueTexture(
        title,
        subtitle,
        featuredLabel,
        prominentLabel,
        nicknameLabel,
      ),
    [featuredLabel, nicknameLabel, prominentLabel, title, subtitle],
  );
  const { gl } = useThree();

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={() => {
        if (onClick) gl.domElement.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        gl.domElement.style.cursor = "auto";
      }}
    >
      <mesh
        onClick={(event) => {
          if (!onClick) return;
          event.stopPropagation();
          onClick();
        }}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} side={DoubleSide} />
      </mesh>
      {marked && (
        <mesh position={[width / 2 - 0.18, height / 2 - 0.17, 0.02]}>
          <circleGeometry args={[0.07, 16]} />
          <meshBasicMaterial color="#d6a0a5" />
        </mesh>
      )}
    </group>
  );
}

function RoomArchitecture({ index }: { index: number }) {
  const centerZ = -index * ROOM_DEPTH;
  const wallMaterial = useMemo(
    () => new MeshStandardMaterial({ color: "#3a2a31", roughness: 0.82 }),
    [],
  );
  useEffect(() => () => wallMaterial.dispose(), [wallMaterial]);

  return (
    <group position={[0, 0, centerZ]}>
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH, 0.3, ROOM_DEPTH]} />
        <meshStandardMaterial color="#34282d" roughness={0.78} />
      </mesh>
      <mesh position={[0, ROOM_HEIGHT, 0]}>
        <boxGeometry args={[ROOM_WIDTH, 0.22, ROOM_DEPTH]} />
        <meshStandardMaterial color="#21191d" roughness={0.94} />
      </mesh>
      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} material={wallMaterial}>
        <boxGeometry args={[0.28, ROOM_HEIGHT, ROOM_DEPTH]} />
      </mesh>
      {index !== 1 && (
        <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} material={wallMaterial}>
          <boxGeometry args={[0.28, ROOM_HEIGHT, ROOM_DEPTH]} />
        </mesh>
      )}
      <mesh position={[-ROOM_WIDTH / 2 + 0.18, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.12, ROOM_DEPTH]} />
        <meshBasicMaterial color="#9b744c" />
      </mesh>
      {index !== 1 && (
        <mesh position={[ROOM_WIDTH / 2 - 0.18, 0.12, 0]}>
          <boxGeometry args={[0.12, 0.12, ROOM_DEPTH]} />
          <meshBasicMaterial color="#9b744c" />
        </mesh>
      )}
      <pointLight
        position={[0, ROOM_HEIGHT - 0.7, 0]}
        color={index === 5 ? "#e5b7a3" : "#f1d8b0"}
        intensity={index === 5 ? 3.2 : 2.4}
        distance={19}
        decay={1.6}
      />
      <mesh position={[0, ROOM_HEIGHT - 0.14, 0]}>
        <boxGeometry args={[3.2, 0.04, 0.06]} />
        <meshBasicMaterial color="#b89669" />
      </mesh>
    </group>
  );
}

function Doorway({ boundary }: { boundary: number }) {
  return (
    <group position={[0, 0, boundary]}>
      {[-2.35, 2.35].map((x) => (
        <mesh key={x} position={[x, 2.35, 0]}>
          <boxGeometry args={[0.24, 4.7, 0.35]} />
          <meshStandardMaterial color="#8f6c4a" metalness={0.45} roughness={0.48} />
        </mesh>
      ))}
      <mesh position={[0, 4.72, 0]}>
        <boxGeometry args={[4.95, 0.24, 0.35]} />
        <meshStandardMaterial color="#8f6c4a" metalness={0.45} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[4.6, 0.08, 0.52]} />
        <meshBasicMaterial color="#d9b77e" />
      </mesh>
      <group position={[0, 0, 0.28]}>
        <FairyLightString points={GATE_LIGHT_PATH} bulbCount={28} />
        <HeartGeometry position={[0, 4.05, 0]} scale={0.38} color="#c8506b" />
        {[-1.42, 1.42].map((x) => (
          <HeartGeometry
            key={`arch-heart-${x}`}
            position={[x, 4.08, 0]}
            scale={0.27}
            color="#e18391"
          />
        ))}
        {[-2.8, 2.8].map((x) => (
          <group key={`gate-flowers-${x}`}>
            {[0.75, 1.65, 2.55, 3.45].map((y, index) => (
              <FlowerDecoration
                key={y}
                position={[x, y, 0.08]}
                size={index === 3 ? 1.15 : 0.95}
              />
            ))}
          </group>
        ))}
        {[-1.9, -0.95, 0, 0.95, 1.9].map((x, index) => (
          <FlowerDecoration
            key={`lintel-flower-${x}`}
            position={[x, 4.5, 0.08]}
            size={index === 2 ? 1.05 : 0.82}
          />
        ))}
        {[-2.3, -1.15, 0, 1.15, 2.3].map((x) => (
          <HeartGeometry
            key={`threshold-heart-${x}`}
            position={[x, 0.55, 0.08]}
            scale={0.15}
            color="#c8506b"
          />
        ))}
      </group>
    </group>
  );
}

function PhotoFrame({
  photo,
  position,
  rotation,
  featured = false,
  onSelect,
}: {
  photo: MuseumPhoto;
  position: [number, number, number];
  rotation: [number, number, number];
  featured?: boolean;
  onSelect: (photo: MuseumPhoto) => void;
}) {
  const texture = useLoader(
    TextureLoader,
    featured ? photo.src : photo.thumbnailSrc,
  );
  const { gl } = useThree();
  const image = texture.image as HTMLImageElement;
  const aspectRatio = image.width / image.height;
  const height =
    featured && photo.id === "portrait-01"
      ? 2.6 / aspectRatio
      : featured
        ? 2.15
        : 1.35;
  const width = Math.min(
    height * aspectRatio,
    featured ? 3.8 : 1.05,
  );
  const frameLightPath = useMemo<Point3[]>(
    () => [
      [-width / 2 - 0.17, -height / 2 - 0.17, 0.11],
      [-width / 2 - 0.17, height / 2 + 0.17, 0.11],
      [width / 2 + 0.17, height / 2 + 0.17, 0.11],
      [width / 2 + 0.17, -height / 2 - 0.17, 0.11],
    ],
    [height, width],
  );

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 4);
    texture.needsUpdate = true;
  }, [gl, texture]);

  return (
    <group position={position} rotation={rotation}>
      <FairyLightString
        points={frameLightPath}
        bulbCount={featured ? 24 : 12}
        closed
      />
      {featured ? (
        <>
          <mesh position={[0, 0, -0.18]}>
            <planeGeometry args={[width + 0.76, height + 0.76]} />
            <meshStandardMaterial
              color="#4a1725"
              metalness={0.26}
              roughness={0.52}
            />
          </mesh>
          <mesh position={[0, 0, -0.08]}>
            <planeGeometry args={[width + 0.42, height + 0.42]} />
            <meshStandardMaterial
              color="#d9b77e"
              metalness={0.52}
              roughness={0.36}
            />
          </mesh>
          <HeartGeometry
            position={[0, height / 2 + 0.32, 0.06]}
            scale={0.17}
            color="#c8506b"
          />
          {[-1, 1].map((side) => (
            <FlowerDecoration
              key={side}
              position={[side * (width / 2 + 0.22), height / 2 + 0.08, 0.07]}
              size={0.74}
            />
          ))}
        </>
      ) : (
        <mesh position={[0, 0, -0.07]}>
          <planeGeometry args={[width + 0.22, height + 0.22]} />
          <meshStandardMaterial color="#b38b58" metalness={0.45} roughness={0.45} />
        </mesh>
      )}
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(photo);
        }}
        onPointerOver={() => {
          gl.domElement.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          gl.domElement.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} side={DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

function PhotoPlaceholder({
  position,
  rotation,
  featured = false,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  featured?: boolean;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={featured ? [3.75, 2.5] : [1.05, 1.35]} />
      <meshStandardMaterial color="#392a2d" roughness={0.72} />
    </mesh>
  );
}

function HeartGeometry({
  position,
  scale = 1,
  rotation = [0, 0, 0],
  color = "#9a4354",
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  color?: string;
}) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, 0.68);
    shape.bezierCurveTo(-0.15, 1.08, -0.95, 1.16, -1.02, 0.48);
    shape.bezierCurveTo(-1.1, -0.05, -0.34, -0.68, 0, -0.98);
    shape.bezierCurveTo(0.34, -0.68, 1.1, -0.05, 1.02, 0.48);
    shape.bezierCurveTo(0.95, 1.16, 0.15, 1.08, 0, 0.68);
    return new ExtrudeGeometry(shape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.08,
      bevelThickness: 0.08,
      steps: 1,
    });
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} scale={scale}>
      <meshStandardMaterial
        color={color}
        emissive="#481925"
        emissiveIntensity={0.55}
        metalness={0.28}
        roughness={0.34}
      />
    </mesh>
  );
}

function FlowerDecoration({
  position,
  size = 1,
}: {
  position: [number, number, number];
  size?: number;
}) {
  const petalColors = ["#d66f82", "#f0b5a9", "#c8506b", "#df9a9b", "#d66f82"];

  return (
    <group position={position} scale={size}>
      {petalColors.map((color, index) => {
        const angle = (index / petalColors.length) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, 0]}
          >
            <sphereGeometry args={[0.115, 12, 8]} />
            <meshStandardMaterial color={color} roughness={0.52} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.04]}>
        <sphereGeometry args={[0.07, 12, 8]} />
        <meshStandardMaterial color="#f0d7a2" roughness={0.48} />
      </mesh>
    </group>
  );
}

function FairyLightString({
  points,
  bulbCount,
  closed = false,
}: {
  points: Point3[];
  bulbCount: number;
  closed?: boolean;
}) {
  const bulbsRef = useRef<InstancedMesh>(null);
  const { wireGeometry, bulbGeometry, bulbMaterial, bulbMatrices } = useMemo(() => {
    const curve = new CatmullRomCurve3(
      points.map((point) => new Vector3(...point)),
      closed,
      "catmullrom",
      0.35,
    );
    const wireGeometry = new TubeGeometry(
      curve,
      Math.max(32, bulbCount * 6),
      0.012,
      5,
      closed,
    );
    const bulbGeometry = new SphereGeometry(0.045, 12, 8);
    const bulbMaterial = new MeshBasicMaterial({
      color: "#ffdc95",
      toneMapped: false,
    });
    const bulbMatrices = Array.from({ length: bulbCount }, (_, index) => {
      const scale = index % 4 === 0 ? 1.15 : 1;
      return new Matrix4()
        .makeScale(scale, scale, scale)
        .setPosition(curve.getPointAt((index + 0.5) / bulbCount));
    });

    return { wireGeometry, bulbGeometry, bulbMaterial, bulbMatrices };
  }, [bulbCount, closed, points]);

  useEffect(
    () => () => {
      wireGeometry.dispose();
      bulbGeometry.dispose();
      bulbMaterial.dispose();
    },
    [bulbGeometry, bulbMaterial, wireGeometry],
  );

  useEffect(() => {
    const bulbs = bulbsRef.current;
    if (!bulbs) return;
    bulbMatrices.forEach((matrix, index) => bulbs.setMatrixAt(index, matrix));
    bulbs.instanceMatrix.needsUpdate = true;
  }, [bulbMatrices]);

  return (
    <>
      <mesh geometry={wireGeometry}>
        <meshBasicMaterial color="#987346" />
      </mesh>
      <instancedMesh
        ref={bulbsRef}
        args={[bulbGeometry, bulbMaterial, bulbCount]}
      />
    </>
  );
}

function RoomFairyLights({ index }: { index: number }) {
  return (
    <group position={[0, 0, -index * ROOM_DEPTH]}>
      {CEILING_LIGHT_PATHS.map((points, pathIndex) => (
        <FairyLightString
          key={`ceiling-${pathIndex}`}
          points={points}
          bulbCount={11}
        />
      ))}
      {WALL_LIGHT_PATHS.map(({ side, points }) =>
        index === 1 && side === 1 ? null : (
          <FairyLightString
            key={`wall-${side}`}
            points={points}
            bulbCount={17}
          />
        ),
      )}
    </group>
  );
}

function ExhibitDisplays({
  onSelectPhoto,
  onToggleName,
  markedNames,
  onOpenLetter,
  scrollProgress,
  reducedMotion,
}: Pick<
  MuseumWorldProps,
  | "onSelectPhoto"
  | "onToggleName"
  | "markedNames"
  | "onOpenLetter"
  | "scrollProgress"
  | "reducedMotion"
>) {
  const relationshipPhoto = photos.find(({ id }) => id === "portrait-19");
  if (!relationshipPhoto) {
    throw new Error("Missing relationship-start photo.");
  }
  const relationshipZ = RELATIONSHIP_FRAME_Z;
  const relationshipPosition: [number, number, number] = [
    PORTRAIT_FRAME_X,
    2.55,
    relationshipZ,
  ];
  const portraitWallRotation: [number, number, number] = [
    0,
    Math.PI / 2,
    0,
  ];

  return (
    <>
      <group>
        <Suspense
          fallback={
            <PhotoPlaceholder
              position={relationshipPosition}
              rotation={portraitWallRotation}
              featured
            />
          }
        >
          <PhotoFrame
            photo={relationshipPhoto}
            position={relationshipPosition}
            rotation={portraitWallRotation}
            featured
            onSelect={onSelectPhoto}
          />
        </Suspense>
        <Plaque
          title={relationshipPhoto.caption ?? "Relationship starting date"}
          subtitle={relationshipPhoto.date ?? "05/09/2026"}
          position={[relationshipPosition[0] + 0.14, 0.64, relationshipZ]}
          rotation={portraitWallRotation}
          width={2.4}
          height={0.96}
          featuredLabel
        />
      </group>
      {photos
        .filter(
          (photo) =>
            PORTRAIT_WALL_PHOTO_IDS.has(photo.id) &&
            photo.id !== "portrait-19",
        )
        .map((photo) => {
          const x = PORTRAIT_FRAME_X;
          const z =
            photo.id === "portrait-01"
              ? FIRST_DATE_FRAME_Z
                : photo.id === "portrait-21"
                  ? HAND_FRACTURE_FRAME_Z
              : photo.id === "portrait-13"
                ? DIWALI_FRAME_Z
                : photo.id === "portrait-16"
                  ? BACHU_FRAME_Z
                  : BOSS_LADY_FRAME_Z;
          const y = 2.55;
          const rotation = portraitWallRotation;

          return (
            <group key={photo.id}>
              <Suspense
                fallback={
                  <PhotoPlaceholder
                    position={[x, y, z]}
                    rotation={rotation}
                    featured
                  />
                }
              >
                <PhotoFrame
                  photo={photo}
                  position={[x, y, z]}
                  rotation={rotation}
                  featured
                  onSelect={onSelectPhoto}
                />
              </Suspense>
              <Plaque
                title={
                  photo.caption ??
                  (photo.id === "portrait-01" ? "First Date" : photo.alt)
                }
                subtitle={photo.date ?? ""}
                position={[x + 0.14, 0.64, z]}
                rotation={rotation}
                width={
                  photo.id === "portrait-16" || photo.id === "portrait-05"
                    ? 2.4
                    : 2.5
                }
                height={0.96}
                featuredLabel
              />
            </group>
          );
        })}

      {NICKNAME_PHOTO_GROUPS.map(({ name, photos: namePhotos }, index) => {
        const nameZ = FIRST_NICKNAME_Z - index * NICKNAME_SPACING;
        return (
          <group key={name}>
            <Plaque
              title={name}
              subtitle={`NAME ${String(index + 1).padStart(2, "0")}`}
              position={[NICKNAME_WALL_X, NICKNAME_LABEL_Y, nameZ]}
              rotation={[0, -Math.PI / 2, 0]}
              width={1.7}
              height={0.74}
              marked={markedNames.includes(name)}
              nicknameLabel
              onClick={() => onToggleName(name)}
            />
            {namePhotos.map((photo, photoIndex) => {
              const position: [number, number, number] = [
                NICKNAME_WALL_X,
                photoIndex === 0
                  ? NICKNAME_PRIMARY_FRAME_Y
                  : NICKNAME_SECONDARY_FRAME_Y,
                nameZ,
              ];
              return (
                <Suspense
                  key={photo.id}
                  fallback={
                    <PhotoPlaceholder
                      position={position}
                      rotation={[0, -Math.PI / 2, 0]}
                    />
                  }
                >
                  <PhotoFrame
                    photo={photo}
                    position={position}
                    rotation={[0, -Math.PI / 2, 0]}
                    onSelect={onSelectPhoto}
                  />
                </Suspense>
              );
            })}
          </group>
        );
      })}

      {NICKNAME_FOLLOWUP_PHOTOS.map((photo, index) => {
        const position: [number, number, number] = [
          NICKNAME_WALL_X,
          NICKNAME_LABEL_Y,
          LAST_NICKNAME_Z -
            NICKNAME_FOLLOWUP_INITIAL_GAP -
            index * NICKNAME_FOLLOWUP_FRAME_SPACING,
        ];
        return (
          <Suspense
            key={photo.id}
            fallback={
              <PhotoPlaceholder
                position={position}
                rotation={[0, -Math.PI / 2, 0]}
              />
            }
          >
            <PhotoFrame
              photo={photo}
              position={position}
              rotation={[0, -Math.PI / 2, 0]}
              onSelect={onSelectPhoto}
            />
          </Suspense>
        );
      })}

      <LetterPedestal
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        onOpenLetter={onOpenLetter}
      />

      <mesh position={[-3.4, 0.55, -2.2]}>
        <cylinderGeometry args={[0.8, 1, 1.1, 32]} />
        <meshStandardMaterial color="#4a1725" roughness={0.62} />
      </mesh>
      <HeartGeometry position={[-3.4, 2.15, -2.2]} />
      <group position={[-3.4, 2.15, -2.2]}>
        <FairyLightString points={HEART_LIGHT_PATH} bulbCount={32} closed />
      </group>
      <HeartInscription position={[-3.4, 2.12, -1.86]} />

      <group position={[0, 0, -4 * ROOM_DEPTH]}>
        <HeartGeometry position={[0, 3.2, -4]} />
        {[1.8, 2.55, 3.25].map((radius, index) => (
          <mesh
            key={radius}
            position={[0, 3.05, -3.8]}
            rotation={[Math.PI / 2 + index * 0.24, 0.18, index * 0.35]}
          >
            <torusGeometry args={[radius, 0.018, 6, 100]} />
            <meshBasicMaterial color={index === 1 ? "#d9b77e" : "#965b67"} />
          </mesh>
        ))}
        <mesh position={[0, 1.05, -3.8]}>
          <boxGeometry args={[4.2, 0.14, 1.4]} />
          <meshStandardMaterial color="#4a1725" roughness={0.66} />
        </mesh>
      </group>
      <BirthdayCake />
    </>
  );
}

function LetterPedestal({
  scrollProgress,
  reducedMotion,
  onOpenLetter,
}: Pick<MuseumWorldProps, "scrollProgress" | "reducedMotion" | "onOpenLetter">) {
  const { gl } = useThree();
  const frontPage = useRef<Group>(null);
  const backPage = useRef<Group>(null);
  const scrollIntoLetter = Math.max(
    0,
    Math.min(
      1,
      (scrollProgress * TOTAL_ROOM_SCROLL_WEIGHT - LETTER_SCROLL_START_WEIGHT) /
        LETTER_UNFOLD_DURATION,
    ),
  );
  const unfoldAmount =
    scrollIntoLetter * scrollIntoLetter * (3 - 2 * scrollIntoLetter);

  useFrame((_, delta) => {
    const foldedAngle = (1 - unfoldAmount) * (Math.PI / 2);
    const follow = reducedMotion ? 1 : 1 - Math.exp(-delta * 7);

    if (frontPage.current) {
      frontPage.current.rotation.x +=
        (foldedAngle - frontPage.current.rotation.x) * follow;
    }
    if (backPage.current) {
      backPage.current.rotation.x +=
        (-foldedAngle - backPage.current.rotation.x) * follow;
    }
  });

  return (
    <group
      position={[0, 0, -3 * ROOM_DEPTH]}
      onPointerOver={() => {
        gl.domElement.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        gl.domElement.style.cursor = "auto";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onOpenLetter();
      }}
    >
      <mesh position={[0, 0.64, -1]}>
        <boxGeometry args={[2.8, 1.25, 1.8]} />
        <meshStandardMaterial color="#4a1725" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.33, -1]}>
        <boxGeometry args={[2.2, 0.16, 1.5]} />
        <meshStandardMaterial color="#e5d6c5" roughness={0.58} />
      </mesh>
      <mesh position={[0, 1.5, -0.42]}>
        <cylinderGeometry args={[0.34, 0.34, 0.12, 32]} />
        <meshStandardMaterial color="#8a3448" metalness={0.3} roughness={0.38} />
      </mesh>
      <mesh position={[0, 2.15, -1]}>
        <boxGeometry args={[3.2, 0.08, 2.2]} />
        <meshStandardMaterial color="#d9b77e" metalness={0.38} roughness={0.48} />
      </mesh>
      <group position={[0, 2.22, -1]}>
        <group ref={frontPage} position={[-0.012, 0, 0]} rotation-x={Math.PI / 2}>
          <mesh position={[0, 0, -0.31]}>
            <boxGeometry args={[1.72, 0.035, 0.62]} />
            <meshStandardMaterial color="#fff4df" roughness={0.82} side={DoubleSide} />
          </mesh>
          {[0, 1, 2].map((line) => (
            <mesh key={line} position={[0, 0.022, -0.16 - line * 0.15]}>
              <boxGeometry args={[line === 2 ? 0.72 : 1.18, 0.006, 0.018]} />
              <meshBasicMaterial color="#b89082" />
            </mesh>
          ))}
        </group>
        <group ref={backPage} position={[0.012, 0, 0]} rotation-x={-Math.PI / 2}>
          <mesh position={[0, 0, 0.31]}>
            <boxGeometry args={[1.72, 0.035, 0.62]} />
            <meshStandardMaterial color="#fff4df" roughness={0.82} side={DoubleSide} />
          </mesh>
          {[0, 1, 2].map((line) => (
            <mesh key={line} position={[0, 0.022, 0.16 + line * 0.15]}>
              <boxGeometry args={[line === 2 ? 0.72 : 1.18, 0.006, 0.018]} />
              <meshBasicMaterial color="#b89082" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

function CreamDripSkirt({
  position,
  radius,
  depth,
  count,
  width,
  phase = 0,
}: {
  position: [number, number, number];
  radius: number;
  depth: number;
  count: number;
  width: number;
  phase?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[radius, radius, 0.08, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#fff0d6"
          roughness={0.28}
          clearcoat={0.18}
          side={DoubleSide}
        />
      </mesh>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + phase;
        const wave = 0.5 + 0.5 * Math.sin(index * 2.37 + phase);
        const dropLength = depth * (0.48 + wave * 0.52);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={index}
            position={[x, -dropLength / 2 - width * 0.45, z]}
            scale={[width, dropLength / 2 + width * 0.45, width]}
          >
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial
              color="#fff0d6"
              roughness={0.28}
              clearcoat={0.18}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function CreamRosette({ size }: { size: number }) {
  return (
    <group>
      <mesh position={[0, size * 0.18, 0]} scale={[1, 0.46, 1]}>
        <sphereGeometry args={[size, 16, 12]} />
        <meshPhysicalMaterial
          color="#fff2df"
          roughness={0.26}
          clearcoat={0.18}
        />
      </mesh>
      <mesh
        position={[0, size * 0.61, 0]}
      >
        <coneGeometry args={[size * 0.76, size * 1.02, 20]} />
        <meshPhysicalMaterial
          color="#fff2df"
          roughness={0.24}
          clearcoat={0.2}
        />
      </mesh>
      <mesh position={[0, size * 0.98, 0]}>
        <sphereGeometry args={[size * 0.22, 12, 10]} />
        <meshPhysicalMaterial
          color="#fff5e8"
          roughness={0.24}
          clearcoat={0.2}
        />
      </mesh>
    </group>
  );
}

function CreamRosetteRing({
  radius,
  y,
  count,
  size,
  phase = 0,
}: {
  radius: number;
  y: number;
  count: number;
  size: number;
  phase?: number;
}) {
  return (
    <group>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + phase;
        return (
          <group
            key={index}
            position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
          >
            <CreamRosette size={size} />
          </group>
        );
      })}
    </group>
  );
}

function createFlameGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create a candle glow texture.");

  const glow = context.createRadialGradient(64, 64, 2, 64, 64, 64);
  glow.addColorStop(0, "rgba(255, 246, 190, 0.9)");
  glow.addColorStop(0.24, "rgba(255, 168, 64, 0.52)");
  glow.addColorStop(0.58, "rgba(255, 92, 24, 0.18)");
  glow.addColorStop(1, "rgba(255, 72, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function CandleFlame({ index }: { index: number }) {
  const flame = useRef<Group>(null);
  const core = useRef<Group>(null);
  const elapsed = useRef(index * 0.83);
  const glowTexture = useMemo(createFlameGlowTexture, []);

  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const time = elapsed.current;
    if (flame.current) {
      flame.current.scale.set(
        1 + Math.sin(time * 8.1) * 0.08,
        1 + Math.sin(time * 6.7 + 0.8) * 0.1,
        1 + Math.sin(time * 7.3 + 1.4) * 0.07,
      );
      flame.current.rotation.z = Math.sin(time * 5.2) * 0.055;
    }
    if (core.current) {
      core.current.scale.y = 1 + Math.sin(time * 7.4 + 0.5) * 0.12;
    }
  });

  return (
    <group position={[0, 0.62, 0]}>
      <sprite position={[0, 0.08, -0.035]} scale={[0.28, 0.36, 1]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <group ref={flame}>
        <mesh position={[0, 0.055, 0]} scale={[0.72, 1.2, 0.72]}>
          <sphereGeometry args={[0.078, 16, 12]} />
          <meshBasicMaterial color="#ff741f" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <coneGeometry args={[0.052, 0.15, 14]} />
          <meshBasicMaterial color="#ff741f" toneMapped={false} />
        </mesh>
      </group>
      <group ref={core}>
        <mesh position={[0, 0.035, 0.025]} scale={[0.42, 0.82, 0.42]}>
          <sphereGeometry args={[0.06, 14, 10]} />
          <meshBasicMaterial color="#ffd36f" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.015, 0.045]} scale={[0.3, 0.52, 0.3]}>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshBasicMaterial color="#fff3c2" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function BirthdayCake() {
  const candlePositions: [number, number][] = [
    [-0.44, 0],
    [-0.22, 0],
    [0, 0],
    [0.22, 0],
    [0.44, 0],
  ];
  const candleGlow = useRef<PointLight>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (candleGlow.current) {
      candleGlow.current.intensity =
        1.65 + Math.sin(elapsed.current * 8.2) * 0.16;
    }
  });

  return (
    <group position={[0, 0, -4 * ROOM_DEPTH + 2]}>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[1.55, 1.62, 0.16, 48]} />
        <meshStandardMaterial color="#c9a15f" metalness={0.2} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[1.22, 1.28, 0.92, 64]} />
        <meshPhysicalMaterial color="#8e2942" roughness={0.38} clearcoat={0.12} />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <cylinderGeometry args={[1.29, 1.29, 0.08, 64]} />
        <meshPhysicalMaterial color="#fff0d6" roughness={0.3} clearcoat={0.18} />
      </mesh>
      <CreamDripSkirt
        position={[0, 1.22, 0]}
        radius={1.285}
        depth={0.26}
        count={15}
        width={0.075}
      />
      <CreamRosetteRing radius={1.08} y={1.22} count={10} size={0.12} />
      <mesh position={[0, 1.56, 0]}>
        <cylinderGeometry args={[0.88, 0.94, 0.68, 64]} />
        <meshPhysicalMaterial color="#c44c63" roughness={0.4} clearcoat={0.12} />
      </mesh>
      <mesh position={[0, 1.92, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.08, 64]} />
        <meshPhysicalMaterial color="#fff0d6" roughness={0.3} clearcoat={0.18} />
      </mesh>
      <CreamDripSkirt
        position={[0, 1.96, 0]}
        radius={0.945}
        depth={0.2}
        count={12}
        width={0.065}
        phase={0.2}
      />
      <CreamRosetteRing radius={0.77} y={1.96} count={8} size={0.105} />
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.62, 0.68, 0.48, 64]} />
        <meshPhysicalMaterial color="#8e2942" roughness={0.38} clearcoat={0.12} />
      </mesh>
      <mesh position={[0, 2.46, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.08, 64]} />
        <meshPhysicalMaterial color="#fff0d6" roughness={0.3} clearcoat={0.18} />
      </mesh>
      <CreamDripSkirt
        position={[0, 2.5, 0]}
        radius={0.695}
        depth={0.14}
        count={9}
        width={0.055}
        phase={0.32}
      />
      <CreamRosetteRing
        radius={0.55}
        y={2.5}
        count={8}
        size={0.075}
        phase={Math.PI / 8}
      />
      <Plaque
        title="Happy Birthday, Siya!"
        position={[0, 3.78, 1.15]}
        width={3.7}
        height={0.72}
        featuredLabel
      />
      <HeartGeometry
        position={[0, 0.72, 1.24]}
        scale={0.18}
        color="#e7a0ad"
      />
      {candlePositions.map(([x, z], index) => (
        <group key={index} position={[x, 2.5, z]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.045, 0.055, 0.5, 20]} />
            <meshPhysicalMaterial
              color={index % 2 === 0 ? "#fff0d6" : "#e5bd7f"}
              roughness={0.28}
              clearcoat={0.22}
            />
          </mesh>
          <mesh position={[0, 0.53, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.07, 8]} />
            <meshStandardMaterial color="#3a2920" roughness={0.88} />
          </mesh>
          <CandleFlame index={index} />
        </group>
      ))}
      <pointLight
        ref={candleGlow}
        position={[0, 3.15, 0]}
        color="#ffae52"
        intensity={1.65}
        distance={5}
        decay={2}
      />
    </group>
  );
}

function RoomLabels() {
  return (
    <>
      {exhibits.map((exhibit, index) => {
        const centerZ = -index * ROOM_DEPTH;
        const isNamesGateSign = index === 2;
        return (
          <Plaque
            key={exhibit.id}
            title={exhibit.title}
            subtitle={`${exhibit.number}  ·  ${exhibit.name}`}
            position={[
              0,
              isNamesGateSign ? NAMES_GATE_SIGN_Y : 3.72,
              isNamesGateSign ? NAMES_GATE_SIGN_Z : centerZ - 6.1,
            ]}
            width={isNamesGateSign ? 4.3 : 5.8}
            height={isNamesGateSign ? 0.96 : 1.3}
            prominentLabel={index === 0 || isNamesGateSign}
          />
        );
      })}
    </>
  );
}

function WalkController({
  scrollProgress,
  reducedMotion,
  onRoomChange,
}: Pick<MuseumWorldProps, "scrollProgress" | "reducedMotion" | "onRoomChange">) {
  const { camera, size } = useThree();
  const lastRoom = useRef(-1);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    camera.fov = size.width <= 760 ? 82 : 66;
    camera.updateProjectionMatrix();
  }, [camera, size.width]);

  useFrame((_, delta) => {
    const progress = Math.max(0, Math.min(1, scrollProgress));
    let remainingRoomProgress = progress * TOTAL_ROOM_SCROLL_WEIGHT;
    let segment = 0;
    while (
      segment < ROOM_SCROLL_WEIGHTS.length - 1 &&
      remainingRoomProgress + ROOM_PROGRESS_EPSILON >=
        ROOM_SCROLL_WEIGHTS[segment]
    ) {
      remainingRoomProgress -= ROOM_SCROLL_WEIGHTS[segment];
      segment += 1;
    }
    const phase = Math.max(
      0,
      Math.min(1, remainingRoomProgress / ROOM_SCROLL_WEIGHTS[segment]),
    );
    const smoothstep = (value: number) => value * value * (3 - 2 * value);
    const lerp = (from: number, to: number, amount: number) =>
      from + (to - from) * amount;
    const easedPhase = smoothstep(phase);
    const interpolate = (values: number[]) =>
      values[segment] + (values[segment + 1] - values[segment]) * easedPhase;
    const gateClearZ = -9.4;
    const gateWaypointZ = -9.8;
    const gatePassPhase = 0.82;
    let targetX: number;
    let targetY: number;
    let targetZ: number;
    let lookAtX: number;
    let lookAtY: number;
    let lookAtZ: number;

    if (segment === 0 && phase < gatePassPhase) {
      const approach = smoothstep(phase / gatePassPhase);
      targetX = CAMERA_X[0];
      targetY = CAMERA_Y[0];
      targetZ = lerp(CAMERA_Z[0], gateWaypointZ, approach);
      lookAtX = LOOK_AT_X[0];
      lookAtY = LOOK_AT_Y[0];
      lookAtZ = lerp(LOOK_AT_Z[0], -15.6, approach);
    } else if (segment === 0 && camera.position.z > gateClearZ) {
      targetX = 0;
      targetY = CAMERA_Y[0];
      targetZ = gateWaypointZ;
      lookAtX = 0;
      lookAtY = LOOK_AT_Y[0];
      lookAtZ = -15.6;
    } else if (segment === 0) {
      const turn = smoothstep((phase - gatePassPhase) / (1 - gatePassPhase));
      targetX = lerp(0, CAMERA_X[1], turn);
      targetY = CAMERA_Y[1];
      targetZ = lerp(gateWaypointZ, CAMERA_Z[1], turn);
      lookAtX = lerp(0, LOOK_AT_X[1], turn);
      lookAtY = lerp(LOOK_AT_Y[0], LOOK_AT_Y[1], turn);
      lookAtZ = lerp(-15.6, LOOK_AT_Z[1], turn);
    } else if (segment === 1) {
      const waypointIndex = Math.max(
        1,
        PORTRAIT_CAMERA_PATH.findIndex(
          (waypoint, index) => index > 0 && phase <= waypoint.phase,
        ),
      );
      const from = PORTRAIT_CAMERA_PATH[waypointIndex - 1];
      const to = PORTRAIT_CAMERA_PATH[waypointIndex];
      const pathPhase = smoothstep(
        (phase - from.phase) / (to.phase - from.phase),
      );
      targetX = lerp(from.position[0], to.position[0], pathPhase);
      targetY = CAMERA_Y[1];
      targetZ = lerp(from.position[1], to.position[1], pathPhase);
      lookAtX = lerp(from.lookAt[0], to.lookAt[0], pathPhase);
      lookAtY = lerp(from.lookAt[1], to.lookAt[1], pathPhase);
      lookAtZ = lerp(from.lookAt[2], to.lookAt[2], pathPhase);
      if (size.width <= 760) {
        const gateApproach = smoothstep(
          Math.max(0, Math.min(1, (phase - 0.72) / 0.14)),
        );
        const gateDeparture = smoothstep(
          Math.max(0, Math.min(1, (phase - 0.92) / 0.08)),
        );
        targetZ += 3.8 * (gateApproach - gateDeparture);
      }
    } else if (segment === 2) {
      const waypointIndex = Math.max(
        1,
        NICKNAME_CAMERA_PATH.findIndex(
          (waypoint, index) => index > 0 && phase <= waypoint.phase,
        ),
      );
      const from = NICKNAME_CAMERA_PATH[waypointIndex - 1];
      const to = NICKNAME_CAMERA_PATH[waypointIndex];
      const pathPhase = smoothstep(
        (phase - from.phase) / (to.phase - from.phase),
      );
      targetX = lerp(from.position[0], to.position[0], pathPhase);
      targetY = CAMERA_Y[2];
      targetZ = lerp(from.position[1], to.position[1], pathPhase);
      lookAtX = lerp(from.lookAt[0], to.lookAt[0], pathPhase);
      lookAtY = lerp(from.lookAt[1], to.lookAt[1], pathPhase);
      lookAtZ = lerp(from.lookAt[2], to.lookAt[2], pathPhase);
    } else {
      targetX = interpolate(CAMERA_X);
      targetY = interpolate(CAMERA_Y);
      targetZ = interpolate(CAMERA_Z);
      lookAtX = interpolate(LOOK_AT_X);
      lookAtY = interpolate(LOOK_AT_Y);
      lookAtZ = interpolate(LOOK_AT_Z);
    }

    const cameraFollow = reducedMotion ? 1 : 1 - Math.exp(-delta * 8);

    camera.position.x += (targetX - camera.position.x) * cameraFollow;
    camera.position.y += (targetY - camera.position.y) * cameraFollow;
    camera.position.z += (targetZ - camera.position.z) * cameraFollow;
    camera.lookAt(lookAtX, lookAtY, lookAtZ);

    const room =
      segment === 0
        ? camera.position.z <= gateClearZ
          ? 1
          : 0
        : segment === 1
          ? camera.position.z <= PORTRAIT_GATE_CLEAR_Z
            ? 2
            : 1
          : segment === ROOM_SCROLL_WEIGHTS.length - 1 && phase >= 1
            ? exhibits.length - 1
          : Math.min(exhibits.length - 1, segment);
    if (room !== lastRoom.current) {
      lastRoom.current = room;
      onRoomChange(room);
    }
  });

  return null;
}

export default function MuseumWorld(props: MuseumWorldProps) {
  useEffect(() => {
    props.onReady();
  }, [props.onReady]);

  return (
    <>
      <color attach="background" args={["#111111"]} />
      <fog attach="fog" args={["#171416", 29, 138]} />
      <ambientLight color="#fff0dd" intensity={1.05} />
      <directionalLight position={[4, 8, 5]} color="#f0d7b3" intensity={2} />
      {exhibits.map((exhibit, index) => (
        <group key={exhibit.id}>
          <RoomArchitecture index={index} />
          <RoomFairyLights index={index} />
        </group>
      ))}
      {exhibits.slice(0, -1).map((exhibit, index) =>
        exhibit.id === "names" ? null : (
          <Doorway
            key={index}
            boundary={-index * ROOM_DEPTH - ROOM_DEPTH / 2}
          />
        ),
      )}
      <RoomLabels />
      <ExhibitDisplays
        onSelectPhoto={props.onSelectPhoto}
        onToggleName={props.onToggleName}
        markedNames={props.markedNames}
        onOpenLetter={props.onOpenLetter}
        scrollProgress={props.scrollProgress}
        reducedMotion={props.reducedMotion}
      />
      <WalkController
        scrollProgress={props.scrollProgress}
        reducedMotion={props.reducedMotion}
        onRoomChange={props.onRoomChange}
      />
    </>
  );
}
