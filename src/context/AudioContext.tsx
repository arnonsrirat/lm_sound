"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

export interface MixerChannel {
  id: string;
  name: string;
  category: "rain" | "whitenoise" | "ambient" | "waves";
  icon: string;
  volume: number; // 0 to 1
  enabled: boolean;
}

export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl?: string;
  audioUrl?: string;
  location?: string;
  channelVolumes?: Record<string, number>;
}

export type PresetTrack = AudioTrack;

export const PRESET_TRACKS: AudioTrack[] = [
  {
    id: "midnight-rain",
    title: "Midnight Rain & Thunder",
    subtitle: "ฝนตกยามค่ำคืนและเสียงสายลม",
    category: "Rain & Storm",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    channelVolumes: { rain: 0.8, whitenoise: 0.2, ambient: 0.4, waves: 0.1 },
  },
  {
    id: "deep-focus-study",
    title: "Deep Focus Workspace",
    subtitle: "คลื่นเสียงเสริมสมาธิและการอ่านหนังสือ",
    category: "Focus & Flow",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/office_room.ogg",
    channelVolumes: { rain: 0.2, whitenoise: 0.7, ambient: 0.5, waves: 0.0 },
  },
  {
    id: "coastal-waves",
    title: "Ocean Shore Breeze",
    subtitle: "เกลียวคลื่นซัดหาดทรายและสายลมชายฝั่ง",
    category: "Nature & Chill",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/water/ocean_waves.ogg",
    channelVolumes: { rain: 0.1, whitenoise: 0.15, ambient: 0.5, waves: 0.85 },
  },
  {
    id: "peaceful-meditation",
    title: "Zen Temple Ambience",
    subtitle: "บรรยากาศสงบนิ่งเพื่อการผ่อนคลายจิตใจ",
    category: "Meditation & Sleep",
    imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/forest_wind.ogg",
    channelVolumes: { rain: 0.35, whitenoise: 0.2, ambient: 0.8, waves: 0.2 },
  },
];

export interface FocusRecipe {
  id: string;
  name: string;
  thaiName: string;
  emoji: string;
  description: string;
  tag: string;
  volumes: {
    rain: number;
    whitenoise: number;
    ambient: number;
    waves: number;
  };
}

export const FOCUS_RECIPES: FocusRecipe[] = [
  {
    id: "deep-focus",
    name: "Deep Focus",
    thaiName: "สมาธิขั้นสูง",
    emoji: "🧠",
    description: "ตัดสิ่งรบกวนรอบข้าง เพิ่มคลื่น White Noise และ Ambient เหมาะแก่การอ่านหนังสือสอบหรือทำงานที่ต้องใช้สมาธิลึก",
    tag: "High Concentration",
    volumes: { rain: 0.05, whitenoise: 0.75, ambient: 0.45, waves: 0.0 },
  },
  {
    id: "rainy-study",
    name: "Rainy Study",
    thaiName: "อ่านหนังสือเคล้าสายฝน",
    emoji: "🌧️",
    description: "เสียงฝนตกกระทบกระจกริมหน้าต่าง ผ่อนคลายสมอง สร้างบรรยากาศอบอุ่นและสบายใจ",
    tag: "Cozy & Calm",
    volumes: { rain: 0.85, whitenoise: 0.2, ambient: 0.35, waves: 0.05 },
  },
  {
    id: "cafe-mode",
    name: "Café Mode",
    thaiName: "คาเฟ่ทำงาน",
    emoji: "☕",
    description: "บรรยากาศร้านกาแฟโปร่งสบาย ดนตรีแอมเบียนต์ลอยเบาๆ ผสมเสียงฝนจางๆ กระตุ้นไอเดียสร้างสรรค์",
    tag: "Creative Flow",
    volumes: { rain: 0.35, whitenoise: 0.3, ambient: 0.7, waves: 0.1 },
  },
  {
    id: "night-coding",
    name: "Night Coding",
    thaiName: "โค้ดดิ้งยามค่ำคืน",
    emoji: "💻",
    description: "เสียงเกลียวคลื่นทะเลและคลื่นสังเคราะห์ลุ่มลึกยามดึก สำหรับโปรแกรมเมอร์และคนทำงานดึก",
    tag: "Late Night Flow",
    volumes: { rain: 0.15, whitenoise: 0.25, ambient: 0.6, waves: 0.75 },
  },
];

// Alias for backwards compatibility
export const AMBIENCE_PRESETS = FOCUS_RECIPES;
export type AmbiencePreset = FocusRecipe;

export interface SleepTimerOption {
  label: string;
  minutes: number | null;
  tag?: string;
  desc: string;
}

export const SLEEP_TIMER_OPTIONS: SleepTimerOption[] = [
  { label: "ปิดตัวตั้งเวลา", minutes: null, desc: "เล่นต่อเนื่องไม่มีกำหนด" },
  { label: "15 นาที", minutes: 15, tag: "Power Nap", desc: "พักสายตาระยะสั้น" },
  { label: "25 นาที", minutes: 25, tag: "Pomodoro", desc: "โฟกัสอ่านหนังสือ 1 Sprint" },
  { label: "45 นาที", minutes: 45, tag: "Study Block", desc: "เซสชันอ่านหนังสือเต็มคาบ" },
  { label: "60 นาที", minutes: 60, tag: "Deep Sleep", desc: "กล่อมนอน / โฟกัสลึก 1 ชม." },
];

export interface CustomBlend {
  id: string;
  name: string;
  emoji: string;
  createdAt: number;
  volumes: {
    rain: number;
    whitenoise: number;
    ambient: number;
    waves: number;
  };
}

export type AcousticMode =
  | "natural"
  | "cozy-room"
  | "rainy-window"
  | "cathedral-echo";

export interface AcousticSpace {
  id: AcousticMode;
  name: string;
  thaiName: string;
  emoji: string;
  description: string;
  dry: number;
  wet: number;
  decay: number;
  duration: number;
  filterFreq: number;
}

export const ACOUSTIC_SPACES: AcousticSpace[] = [
  {
    id: "natural",
    name: "Natural Direct",
    thaiName: "เสียงธรรมชาติปกติ",
    emoji: "🍃",
    description: "เสียงคมชัดตรงจากแหล่งกำเนิด ไม่ปรุงแต่งมิติสะท้อน",
    dry: 1.0,
    wet: 0.0,
    decay: 1.0,
    duration: 0.5,
    filterFreq: 20000,
  },
  {
    id: "cozy-room",
    name: "Cozy Study Room",
    thaiName: "ห้องอ่านหนังสือส่วนตัว",
    emoji: "🛋️",
    description: "มิติห้องขนาดเล็ก อบอุ่น นุ่มนวล ลดเสียงย่านแหลมบาดหู",
    dry: 0.8,
    wet: 0.35,
    decay: 2.0,
    duration: 0.8,
    filterFreq: 3200,
  },
  {
    id: "rainy-window",
    name: "Rainy Windowpane",
    thaiName: "หลังกระจกริมหน้าต่าง",
    emoji: "🪟",
    description: "จำลองการนั่งอ่านหนังสือในห้องอุ่นๆ ฟังเสียงฝนผ่านแผ่นกระจก",
    dry: 0.7,
    wet: 0.45,
    decay: 2.5,
    duration: 1.2,
    filterFreq: 2200,
  },
  {
    id: "cathedral-echo",
    name: "Grand Library Hall",
    thaiName: "โถงห้องสมุดเพดานสูง",
    emoji: "🏛️",
    description: "มิติกว้างใหญ่ เสียงก้องสะท้อนลึกและโปร่งสบาย เหมาะกับเสียงสมาธิยาว",
    dry: 0.6,
    wet: 0.65,
    decay: 3.2,
    duration: 2.5,
    filterFreq: 4500,
  },
];

export type BinauralMode = "off" | "alpha" | "theta" | "beta";

export interface BinauralPreset {
  id: BinauralMode;
  name: string;
  thaiName: string;
  emoji: string;
  beatHz: number;
  baseHz: number;
  description: string;
  benefits: string;
}

export const BINAURAL_PRESETS: BinauralPreset[] = [
  {
    id: "alpha",
    name: "Alpha Wave (10 Hz)",
    thaiName: "คลื่นอัลฟา (Alpha Flow)",
    emoji: "🧘",
    beatHz: 10,
    baseHz: 216,
    description:
      "ความถี่ 10 Hz เพื่อการมีสมาธินิ่ง อ่านหนังสือจำแม่น ผ่อนคลายโดยไม่ง่วง",
    benefits: "เหมาะสำหรับอ่านหนังสือ ท่องจำ และโฟกัสการเรียน",
  },
  {
    id: "theta",
    name: "Theta Wave (6 Hz)",
    thaiName: "คลื่นเธตา (Deep Relaxation)",
    emoji: "🌙",
    beatHz: 6,
    baseHz: 144,
    description:
      "ความถี่ 6 Hz ชะลอคลื่นสมองสู่สภาวะผ่อนคลายลึก จินตนาการ และความคิดสร้างสรรค์",
    benefits: "เหมาะสำหรับเขียนบทความ ออกแบบไอเดียใหม่ และคลายความเครียด",
  },
  {
    id: "beta",
    name: "Beta Wave (15 Hz)",
    thaiName: "คลื่นบีตา (Active Problem Solving)",
    emoji: "⚡",
    beatHz: 15,
    baseHz: 240,
    description:
      "ความถี่ 15 Hz กระตุ้นสมองสู่สภาวะตื่นตัว วิเคราะห์เชิงตรรกะและการตัดสินใจ",
    benefits: "เหมาะสำหรับเขียนโค้ด แก้โจทย์คณิตศาสตร์ และงานที่ต้องคิดวิเคราะห์เร็ว",
  },
];

export interface EqBands {
  bass: number; // -10 to +10 dB (Lowshelf 120Hz)
  mid: number; // -10 to +10 dB (Peaking 1000Hz)
  treble: number; // -10 to +10 dB (Highshelf 6000Hz)
}

export interface EqPreset {
  id: string;
  name: string;
  thaiName: string;
  emoji: string;
  description: string;
  bands: EqBands;
}

export const EQ_PRESETS: EqPreset[] = [
  {
    id: "flat",
    name: "Flat / Neutral",
    thaiName: "สมดุลธรรมชาติ",
    emoji: "🎵",
    description: "เสียงคมชัดตรงตามต้นฉบับ ไม่ผ่านการปรุงแต่งย่านความถี่",
    bands: { bass: 0, mid: 0, treble: 0 },
  },
  {
    id: "bass-boost",
    name: "Deep Warm Bass",
    thaiName: "เบสอุ่นลึก",
    emoji: "🌊",
    description: "เพิ่มมวลเสียงทุ้มลึก หนักแน่น เสริมพลังเสียงฝนตกและคลื่นทะเล",
    bands: { bass: 6, mid: 0, treble: -2 },
  },
  {
    id: "focus-clarity",
    name: "Focus Clarity",
    thaiName: "สมาธิคมชัด",
    emoji: "💡",
    description: "ตัดเสียงฮัมย่านต่ำ เสริมความใสเคลียร์ของเสียง ช่วยให้สมองโฟกัสไว",
    bands: { bass: -4, mid: 2, treble: 4 },
  },
  {
    id: "soft-comfort",
    name: "Ear Comfort",
    thaiName: "ฟังสบายนุ่มหู",
    emoji: "☁️",
    description: "ลดเสียงแหลมบาดหู ฟังสบายต่อเนื่องยาวนานโดยไม่ล้าหูหรือปวดหัว",
    bands: { bass: 2, mid: -1, treble: -6 },
  },
  {
    id: "lofi-warmth",
    name: "Vintage Lo-Fi",
    thaiName: "โลไฟย้อนยุค",
    emoji: "📻",
    description: "เพิ่มเสียงย่านกลางและเบสอุ่น สไตล์เทปคาสเซ็ทคลาสสิก",
    bands: { bass: 5, mid: 3, treble: -5 },
  },
];

export type PomodoroPhase = "idle" | "focus" | "break";

export interface PomodoroPreset {
  id: string;
  name: string;
  thaiName: string;
  emoji: string;
  focusMinutes: number;
  breakMinutes: number;
  description: string;
}

export const POMODORO_PRESETS: PomodoroPreset[] = [
  {
    id: "classic",
    name: "Classic 25 / 5",
    thaiName: "คลาสสิก (25/5 นาที)",
    emoji: "🍅",
    focusMinutes: 25,
    breakMinutes: 5,
    description: "โฟกัสอ่านหนังสือ 25 นาที สลับพักสายตา 5 นาที มาตรฐานยอดนิยม",
  },
  {
    id: "extended",
    name: "Deep Study 50 / 10",
    thaiName: "อ่านลึก (50/10 นาที)",
    emoji: "📚",
    focusMinutes: 50,
    breakMinutes: 10,
    description: "เซสชันยาวสำหรับเตรียมสอบหรือเขียนโค้ดต่อเนื่อง สลับพัก 10 นาที",
  },
  {
    id: "sprint",
    name: "Sprint 15 / 3",
    thaiName: "สปรินต์สั้น (15/3 นาที)",
    emoji: "⚡",
    focusMinutes: 15,
    breakMinutes: 3,
    description: "กระตุ้นโฟกัสแบบเร่งด่วน ทบทวนสรุปสั้นๆ สลับพัก 3 นาที",
  },
];

// Pure mathematical Tibetan Zen Singing Bowl / Meditation Chime synthesis (528 Hz Solfeggio harmonics)
function playZenBellChime(ctx: AudioContext, destinationNode: AudioNode) {
  const now = ctx.currentTime;
  const partials = [
    { freq: 528, gain: 0.35, decay: 3.2 },
    { freq: 1056, gain: 0.18, decay: 2.2 },
    { freq: 1584, gain: 0.09, decay: 1.5 },
    { freq: 2640, gain: 0.04, decay: 0.8 },
  ];

  partials.forEach(({ freq, gain, decay }) => {
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.006);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(destinationNode);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    } catch {}
  });
}

export interface StudyStats {
  todayMinutes: number;
  totalMinutes: number;
  streakDays: number;
  bestStreak: number;
  lastActiveDate: string;
  dailyHistory: Record<string, number>;
}

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface AudioContextType {
  isPlaying: boolean;
  masterVolume: number;
  activeTrack: AudioTrack;
  tracks: AudioTrack[];
  focusRecipes: FocusRecipe[];
  mixerChannels: MixerChannel[];
  isMixerOpen: boolean;
  isNowPlayingOpen: boolean;
  activePresetId: string | null;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  isSynthesizerFallback: boolean;
  recentlyPlayed: AudioTrack[];
  customBlends: CustomBlend[];
  currentTime: number;
  duration: number;
  isLiveStream: boolean;
  acousticMode: AcousticMode;
  acousticSpaces: AcousticSpace[];
  binauralMode: BinauralMode;
  binauralVolume: number;
  binauralPresets: BinauralPreset[];
  eqPresetId: string;
  eqBands: EqBands;
  eqPresets: EqPreset[];
  pomodoroPhase: PomodoroPhase;
  pomodoroPresetId: string;
  pomodoroSecondsLeft: number | null;
  pomodoroTotalSeconds: number | null;
  pomodoroPresets: PomodoroPreset[];
  studyStats: StudyStats;
  isStatsModalOpen: boolean;
  seek: (seconds: number) => void;
  skipTime: (deltaSeconds: number) => void;
  setAcousticSpace: (mode: AcousticMode) => void;
  setBinauralMode: (mode: BinauralMode) => void;
  setBinauralVolume: (vol: number) => void;
  setEqPreset: (presetId: string) => void;
  setEqBand: (band: "bass" | "mid" | "treble", gainDb: number) => void;
  resetEq: () => void;
  startPomodoro: (presetId?: string) => void;
  stopPomodoro: () => void;
  skipPomodoroPhase: () => void;
  playChime: () => void;
  setIsStatsModalOpen: (open: boolean) => void;
  resetStudyStats: () => void;
  setSleepTimer: (minutes: number | null) => void;
  retryAudioSource: () => void;
  clearRecentlyPlayed: () => void;
  getShareableUrl: () => string;
  saveCustomBlend: (name: string, emoji?: string) => void;
  deleteCustomBlend: (id: string) => void;
  applyCustomBlend: (blend: CustomBlend) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  setMasterVolume: (vol: number) => void;
  selectTrack: (trackId: string) => void;
  playSpot: (track: AudioTrack) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setChannelVolume: (channelId: string, volume: number) => void;
  toggleChannel: (channelId: string) => void;
  applyAmbiencePreset: (presetId: string) => void;
  applyFocusRecipe: (recipeId: string) => void;
  setIsMixerOpen: (open: boolean) => void;
  setIsNowPlayingOpen: (open: boolean) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolumeState] = useState(0.75);
  const [activeTrack, setActiveTrack] = useState<AudioTrack>(PRESET_TRACKS[0]);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(true);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isSynthesizerFallback, setIsSynthesizerFallback] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<AudioTrack[]>([]);
  const [customBlends, setCustomBlends] = useState<CustomBlend[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [acousticMode, setAcousticMode] = useState<AcousticMode>("natural");
  const [binauralMode, setBinauralModeState] = useState<BinauralMode>("off");
  const [binauralVolume, setBinauralVolumeState] = useState(0.15);
  const [eqPresetId, setEqPresetId] = useState<string>("flat");
  const [eqBands, setEqBands] = useState<EqBands>({ bass: 0, mid: 0, treble: 0 });
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("idle");
  const [pomodoroPresetId, setPomodoroPresetId] = useState<string>("classic");
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState<number | null>(null);
  const [pomodoroTotalSeconds, setPomodoroTotalSeconds] = useState<number | null>(null);
  const [studyStats, setStudyStats] = useState<StudyStats>({
    todayMinutes: 0,
    totalMinutes: 0,
    streakDays: 0,
    bestStreak: 0,
    lastActiveDate: "",
    dailyHistory: {},
  });
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const activeFocusSecondsRef = useRef(0);
  const lastFocusTimestampRef = useRef(0);

  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  const [mixerChannels, setMixerChannels] = useState<MixerChannel[]>([
    {
      id: "rain",
      name: "Rain & Droplets",
      category: "rain",
      icon: "CloudRain",
      volume: 0.8,
      enabled: true,
    },
    {
      id: "whitenoise",
      name: "White / Pink Noise",
      category: "whitenoise",
      icon: "Radio",
      volume: 0.4,
      enabled: true,
    },
    {
      id: "ambient",
      name: "Atmospheric Drone",
      category: "ambient",
      icon: "Wind",
      volume: 0.5,
      enabled: true,
    },
    {
      id: "waves",
      name: "Ocean Waves",
      category: "waves",
      icon: "Waves",
      volume: 0.3,
      enabled: true,
    },
  ]);

  // Audio nodes refs for persistent sound generation & spatial acoustics
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const spatialBusRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const spatialFilterRef = useRef<BiquadFilterNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const binauralGainRef = useRef<GainNode | null>(null);
  const binauralOscLeftRef = useRef<OscillatorNode | null>(null);
  const binauralOscRightRef = useRef<OscillatorNode | null>(null);
  const eqNodesRef = useRef<{
    bassFilter: BiquadFilterNode;
    midFilter: BiquadFilterNode;
    trebleFilter: BiquadFilterNode;
  } | null>(null);

  const channelNodesRef = useRef<
    Record<
      string,
      {
        gainNode: GainNode;
        sourceNode?: AudioNode;
        stop?: () => void;
      }
    >
  >({});

  // Synthesize realistic acoustic room impulse response buffer
  function createImpulseResponse(
    ctx: AudioContext,
    durationSec: number,
    decay: number
  ) {
    const sampleRate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * durationSec));
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const factor = Math.pow(1 - i / length, decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return impulse;
  }

  // Create Web Audio generators for each sound channel connected to spatialBus
  function initSynthesizers(ctx: AudioContext, inputBus: GainNode) {
    // 1. Rain Synthesizer (Filtered Noise with droplet modulation)
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0, ctx.currentTime);
    rainGain.connect(inputBus);

    const rainBufferSize = ctx.sampleRate * 2;
    const rainBuffer = ctx.createBuffer(1, rainBufferSize, ctx.sampleRate);
    const rainOutput = rainBuffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0;
    for (let i = 0; i < rainBufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      rainOutput[i] = (b0 + b1 + b2) * 0.12;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.setValueAtTime(1400, ctx.currentTime);
    rainFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainSource.start(0);

    channelNodesRef.current["rain"] = {
      gainNode: rainGain,
      sourceNode: rainSource,
      stop: () => {
        try {
          rainSource.stop();
        } catch {}
      },
    };

    // 2. White / Pink Noise Synthesizer
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, ctx.currentTime);
    noiseGain.connect(inputBus);

    const noiseBuffer = ctx.createBuffer(1, rainBufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < rainBufferSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(800, ctx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseSource.start(0);

    channelNodesRef.current["whitenoise"] = {
      gainNode: noiseGain,
      sourceNode: noiseSource,
      stop: () => {
        try {
          noiseSource.stop();
        } catch {}
      },
    };

    // 3. Atmospheric Drone Synthesizer (Warm ambient harmonic chords)
    const ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    ambientGain.connect(inputBus);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3

    const oscGain1 = ctx.createGain();
    const oscGain2 = ctx.createGain();
    oscGain1.gain.setValueAtTime(0.08, ctx.currentTime);
    oscGain2.gain.setValueAtTime(0.05, ctx.currentTime);

    osc1.connect(oscGain1);
    osc2.connect(oscGain2);
    oscGain1.connect(ambientGain);
    oscGain2.connect(ambientGain);

    osc1.start(0);
    osc2.start(0);

    channelNodesRef.current["ambient"] = {
      gainNode: ambientGain,
      sourceNode: oscGain1,
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
        } catch {}
      },
    };

    // 4. Ocean Waves Synthesizer (Low-pass noise with LFO cycle)
    const wavesGain = ctx.createGain();
    wavesGain.gain.setValueAtTime(0, ctx.currentTime);
    wavesGain.connect(inputBus);

    const waveBuffer = ctx.createBuffer(1, rainBufferSize, ctx.sampleRate);
    const waveData = waveBuffer.getChannelData(0);
    for (let i = 0; i < rainBufferSize; i++) {
      waveData[i] = (Math.random() * 2 - 1) * 0.1;
    }
    const waveSource = ctx.createBufferSource();
    waveSource.buffer = waveBuffer;
    waveSource.loop = true;

    const waveFilter = ctx.createBiquadFilter();
    waveFilter.type = "bandpass";
    waveFilter.frequency.setValueAtTime(450, ctx.currentTime);
    waveFilter.Q.setValueAtTime(0.8, ctx.currentTime);

    // LFO for wave swelling effect
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8 second cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.6, ctx.currentTime);

    lfo.connect(lfoGain.gain);
    waveSource.connect(waveFilter);
    waveFilter.connect(wavesGain);

    lfo.start(0);
    waveSource.start(0);

    channelNodesRef.current["waves"] = {
      gainNode: wavesGain,
      sourceNode: waveSource,
      stop: () => {
        try {
          waveSource.stop();
          lfo.stop();
        } catch {}
      },
    };
  }

  // Ensure AudioContext is instantiated
  const getOrCreateAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtxClass();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);

      // Setup 3-Band Parametric Equalizer Bus
      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = "lowshelf";
      bassFilter.frequency.setValueAtTime(120, ctx.currentTime);
      bassFilter.gain.setValueAtTime(eqBands.bass, ctx.currentTime);

      const midFilter = ctx.createBiquadFilter();
      midFilter.type = "peaking";
      midFilter.frequency.setValueAtTime(1000, ctx.currentTime);
      midFilter.Q.setValueAtTime(1.0, ctx.currentTime);
      midFilter.gain.setValueAtTime(eqBands.mid, ctx.currentTime);

      const trebleFilter = ctx.createBiquadFilter();
      trebleFilter.type = "highshelf";
      trebleFilter.frequency.setValueAtTime(6000, ctx.currentTime);
      trebleFilter.gain.setValueAtTime(eqBands.treble, ctx.currentTime);

      masterGain.connect(bassFilter);
      bassFilter.connect(midFilter);
      midFilter.connect(trebleFilter);
      trebleFilter.connect(ctx.destination);

      eqNodesRef.current = { bassFilter, midFilter, trebleFilter };

      // Setup Spatial Acoustics DSP bus
      const spatialBus = ctx.createGain();
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const spatialFilter = ctx.createBiquadFilter();
      const convolver = ctx.createConvolver();

      spatialFilter.type = "lowpass";

      const initialSpace =
        ACOUSTIC_SPACES.find((s) => s.id === acousticMode) || ACOUSTIC_SPACES[0];

      dryGain.gain.setValueAtTime(initialSpace.dry, ctx.currentTime);
      wetGain.gain.setValueAtTime(initialSpace.wet, ctx.currentTime);
      spatialFilter.frequency.setValueAtTime(
        initialSpace.filterFreq,
        ctx.currentTime
      );
      if (initialSpace.wet > 0) {
        convolver.buffer = createImpulseResponse(
          ctx,
          initialSpace.duration,
          initialSpace.decay
        );
      }

      // Route Dry path: spatialBus -> dryGain -> masterGain
      spatialBus.connect(dryGain);
      dryGain.connect(masterGain);

      // Route Wet path: spatialBus -> spatialFilter -> convolver -> wetGain -> masterGain
      spatialBus.connect(spatialFilter);
      spatialFilter.connect(convolver);
      convolver.connect(wetGain);
      wetGain.connect(masterGain);

      // Setup Binaural Beats Generator
      const binauralGain = ctx.createGain();
      const pannerLeft = ctx.createStereoPanner
        ? ctx.createStereoPanner()
        : null;
      const pannerRight = ctx.createStereoPanner
        ? ctx.createStereoPanner()
        : null;
      if (pannerLeft) pannerLeft.pan.setValueAtTime(-1, ctx.currentTime);
      if (pannerRight) pannerRight.pan.setValueAtTime(1, ctx.currentTime);

      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      oscLeft.type = "sine";
      oscRight.type = "sine";

      const initialBinaural =
        BINAURAL_PRESETS.find((p) => p.id === binauralMode) ||
        BINAURAL_PRESETS[0];
      oscLeft.frequency.setValueAtTime(initialBinaural.baseHz, ctx.currentTime);
      oscRight.frequency.setValueAtTime(
        initialBinaural.baseHz + initialBinaural.beatHz,
        ctx.currentTime
      );

      const initialBinGain =
        binauralMode !== "off" && isPlaying ? binauralVolume : 0;
      binauralGain.gain.setValueAtTime(initialBinGain, ctx.currentTime);

      if (pannerLeft && pannerRight) {
        oscLeft.connect(pannerLeft);
        pannerLeft.connect(binauralGain);
        oscRight.connect(pannerRight);
        pannerRight.connect(binauralGain);
      } else {
        oscLeft.connect(binauralGain);
        oscRight.connect(binauralGain);
      }

      binauralGain.connect(masterGain);
      oscLeft.start(0);
      oscRight.start(0);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      spatialBusRef.current = spatialBus;
      dryGainRef.current = dryGain;
      wetGainRef.current = wetGain;
      spatialFilterRef.current = spatialFilter;
      convolverRef.current = convolver;
      binauralGainRef.current = binauralGain;
      binauralOscLeftRef.current = oscLeft;
      binauralOscRightRef.current = oscRight;

      initSynthesizers(ctx, spatialBus);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, [masterVolume, acousticMode, binauralMode, binauralVolume, isPlaying, eqBands]);

  // Sync channel gains whenever channels or playing state changes
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    mixerChannels.forEach((ch) => {
      const node = channelNodesRef.current[ch.id];
      if (node && node.gainNode) {
        const targetVol = isPlaying && ch.enabled ? ch.volume : 0;
        node.gainNode.gain.setTargetAtTime(targetVol, ctx.currentTime, 0.08);
      }
    });
  }, [mixerChannels, isPlaying]);

  // Set acoustic space reverb mode
  const setAcousticSpace = useCallback((mode: AcousticMode) => {
    setAcousticMode(mode);
    try {
      localStorage.setItem("lhobmoom_acoustic_mode_v1", mode);
    } catch {
      // Safe fallback
    }

    const space =
      ACOUSTIC_SPACES.find((s) => s.id === mode) || ACOUSTIC_SPACES[0];
    const ctx = audioCtxRef.current;
    if (
      ctx &&
      dryGainRef.current &&
      wetGainRef.current &&
      spatialFilterRef.current &&
      convolverRef.current
    ) {
      dryGainRef.current.gain.setTargetAtTime(space.dry, ctx.currentTime, 0.08);
      wetGainRef.current.gain.setTargetAtTime(space.wet, ctx.currentTime, 0.08);
      spatialFilterRef.current.frequency.setTargetAtTime(
        space.filterFreq,
        ctx.currentTime,
        0.08
      );

      if (space.wet > 0) {
        convolverRef.current.buffer = createImpulseResponse(
          ctx,
          space.duration,
          space.decay
        );
      }
    }
  }, []);

  // Set Binaural Beat mode
  const setBinauralMode = useCallback(
    (mode: BinauralMode) => {
      setBinauralModeState(mode);
      try {
        localStorage.setItem("lhobmoom_binaural_mode_v1", mode);
      } catch {
        // Safe fallback
      }

      const ctx = audioCtxRef.current;
      if (!ctx || !binauralGainRef.current) return;

      if (mode === "off") {
        binauralGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
        return;
      }

      const preset =
        BINAURAL_PRESETS.find((p) => p.id === mode) || BINAURAL_PRESETS[0];
      if (binauralOscLeftRef.current && binauralOscRightRef.current) {
        binauralOscLeftRef.current.frequency.setTargetAtTime(
          preset.baseHz,
          ctx.currentTime,
          0.05
        );
        binauralOscRightRef.current.frequency.setTargetAtTime(
          preset.baseHz + preset.beatHz,
          ctx.currentTime,
          0.05
        );
      }

      const targetGain = isPlaying ? binauralVolume : 0;
      binauralGainRef.current.gain.setTargetAtTime(
        targetGain,
        ctx.currentTime,
        0.08
      );
    },
    [isPlaying, binauralVolume]
  );

  const setBinauralVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(1, vol));
      setBinauralVolumeState(clamped);
      try {
        localStorage.setItem("lhobmoom_binaural_vol_v1", clamped.toString());
      } catch {
        // Safe fallback
      }
      const ctx = audioCtxRef.current;
      if (
        ctx &&
        binauralGainRef.current &&
        binauralMode !== "off" &&
        isPlaying
      ) {
        binauralGainRef.current.gain.setTargetAtTime(
          clamped,
          ctx.currentTime,
          0.05
        );
      }
    },
    [binauralMode, isPlaying]
  );

  // Sync binaural volume with playing state
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !binauralGainRef.current) return;
    const targetGain =
      isPlaying && binauralMode !== "off" ? binauralVolume : 0;
    binauralGainRef.current.gain.setTargetAtTime(
      targetGain,
      ctx.currentTime,
      0.08
    );
  }, [isPlaying, binauralMode, binauralVolume]);

  // Apply EQ band gains smoothly to BiquadFilterNodes
  const applyEqBandsToNodes = useCallback((bands: EqBands) => {
    const ctx = audioCtxRef.current;
    const eq = eqNodesRef.current;
    if (ctx && eq) {
      eq.bassFilter.gain.setTargetAtTime(bands.bass, ctx.currentTime, 0.05);
      eq.midFilter.gain.setTargetAtTime(bands.mid, ctx.currentTime, 0.05);
      eq.trebleFilter.gain.setTargetAtTime(bands.treble, ctx.currentTime, 0.05);
    }
  }, []);

  // Set EQ Preset
  const setEqPreset = useCallback(
    (presetId: string) => {
      const found = EQ_PRESETS.find((p) => p.id === presetId);
      if (!found) return;
      setEqPresetId(presetId);
      setEqBands(found.bands);
      applyEqBandsToNodes(found.bands);
      try {
        localStorage.setItem("lhobmoom_eq_preset_v1", presetId);
        localStorage.setItem(
          "lhobmoom_eq_bands_v1",
          JSON.stringify(found.bands)
        );
      } catch {
        // Safe fallback
      }
    },
    [applyEqBandsToNodes]
  );

  // Set individual EQ band (Bass, Mid, Treble)
  const setEqBand = useCallback(
    (band: "bass" | "mid" | "treble", gainDb: number) => {
      const clamped = Math.max(-10, Math.min(10, Math.round(gainDb)));
      setEqBands((prev) => {
        const updated = { ...prev, [band]: clamped };
        const matchingPreset = EQ_PRESETS.find(
          (p) =>
            p.bands.bass === updated.bass &&
            p.bands.mid === updated.mid &&
            p.bands.treble === updated.treble
        );
        const nextPresetId = matchingPreset ? matchingPreset.id : "custom";
        setEqPresetId(nextPresetId);
        applyEqBandsToNodes(updated);
        try {
          localStorage.setItem("lhobmoom_eq_preset_v1", nextPresetId);
          localStorage.setItem(
            "lhobmoom_eq_bands_v1",
            JSON.stringify(updated)
          );
        } catch {
          // Safe fallback
        }
        return updated;
      });
    },
    [applyEqBandsToNodes]
  );

  // Reset EQ to Flat
  const resetEq = useCallback(() => {
    setEqPreset("flat");
  }, [setEqPreset]);

  // Safe localStorage audio preferences hydration
  useEffect(() => {
    try {
      const savedAcoustic = localStorage.getItem(
        "lhobmoom_acoustic_mode_v1"
      ) as AcousticMode | null;
      if (savedAcoustic && ACOUSTIC_SPACES.some((s) => s.id === savedAcoustic)) {
        setAcousticMode(savedAcoustic);
      }
    } catch {
      // Safe fallback
    }

    try {
      const savedBinaural = localStorage.getItem(
        "lhobmoom_binaural_mode_v1"
      ) as BinauralMode | null;
      if (
        savedBinaural &&
        (savedBinaural === "off" ||
          BINAURAL_PRESETS.some((p) => p.id === savedBinaural))
      ) {
        setBinauralModeState(savedBinaural);
      }

      const savedBinauralVol = localStorage.getItem("lhobmoom_binaural_vol_v1");
      if (savedBinauralVol) {
        const parsed = parseFloat(savedBinauralVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          setBinauralVolumeState(parsed);
        }
      }
    } catch {
      // Safe fallback
    }

    try {
      const savedEqPreset = localStorage.getItem("lhobmoom_eq_preset_v1");
      const savedEqBands = localStorage.getItem("lhobmoom_eq_bands_v1");
      if (savedEqBands) {
        const parsed = JSON.parse(savedEqBands);
        if (
          typeof parsed.bass === "number" &&
          typeof parsed.mid === "number" &&
          typeof parsed.treble === "number"
        ) {
          setEqBands(parsed);
          if (savedEqPreset) {
            setEqPresetId(savedEqPreset);
          }
        }
      }
    } catch {
      // Safe fallback
    }

    try {
      const stored = localStorage.getItem("lhobmoom_audio_settings_v1");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (typeof parsed.masterVolume === "number" && !isNaN(parsed.masterVolume)) {
        const safeVol = Math.max(0, Math.min(1, parsed.masterVolume));
        setMasterVolumeState(safeVol);
        if (htmlAudioRef.current) {
          htmlAudioRef.current.volume = safeVol;
        }
      }
      if (typeof parsed.activePresetId === "string" || parsed.activePresetId === null) {
        setActivePresetId(parsed.activePresetId);
      }
      if (Array.isArray(parsed.mixerChannels)) {
        setMixerChannels((prev) =>
          prev.map((ch) => {
            const matched = parsed.mixerChannels.find(
              (c: { id: string; volume?: number; enabled?: boolean }) => c.id === ch.id
            );
            if (matched) {
              return {
                ...ch,
                volume: typeof matched.volume === "number" ? matched.volume : ch.volume,
                enabled: typeof matched.enabled === "boolean" ? matched.enabled : ch.enabled,
              };
            }
            return ch;
          })
        );
      }
    } catch {
      // Graceful fallback if storage unavailable
    }
  }, []);

  // Save volume & mixer channel preferences to localStorage
  useEffect(() => {
    try {
      const data = {
        masterVolume,
        activePresetId,
        mixerChannels: mixerChannels.map((c) => ({
          id: c.id,
          volume: c.volume,
          enabled: c.enabled,
        })),
      };
      localStorage.setItem("lhobmoom_audio_settings_v1", JSON.stringify(data));
    } catch {
      // Graceful fallback
    }
  }, [masterVolume, activePresetId, mixerChannels]);

  // Load recently played tracks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lhobmoom_recently_played_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentlyPlayed(parsed);
        }
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const addToRecentlyPlayed = useCallback((track: AudioTrack) => {
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(
          "lhobmoom_recently_played_v1",
          JSON.stringify(updated)
        );
      } catch {
        // Safe fallback
      }
      return updated;
    });
  }, []);

  const clearRecentlyPlayed = useCallback(() => {
    setRecentlyPlayed([]);
    try {
      localStorage.removeItem("lhobmoom_recently_played_v1");
    } catch {
      // Safe fallback
    }
  }, []);

  // Parse shared soundscape query parameters from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedPreset = params.get("preset");
      const sharedTrack = params.get("track");
      const sharedTimer = params.get("timer");

      if (sharedTrack) {
        const found = PRESET_TRACKS.find((t) => t.id === sharedTrack);
        if (found) {
          setActiveTrack(found);
        }
      }

      if (sharedPreset && sharedPreset !== "custom") {
        const foundRecipe = FOCUS_RECIPES.find((r) => r.id === sharedPreset);
        if (foundRecipe) {
          setActivePresetId(sharedPreset);
        }
      }

      const channelKeys = ["rain", "whitenoise", "ambient", "waves"];
      const hasCustomChannels = channelKeys.some((k) => params.has(k));

      if (hasCustomChannels) {
        if (!sharedPreset || sharedPreset === "custom") {
          setActivePresetId("custom");
        }
        setMixerChannels((prev) =>
          prev.map((ch) => {
            const paramVal = params.get(ch.id);
            if (paramVal !== null) {
              const parsedNum = parseInt(paramVal, 10);
              if (!isNaN(parsedNum)) {
                const clamped = Math.max(0, Math.min(100, parsedNum)) / 100;
                return {
                  ...ch,
                  volume: clamped,
                  enabled: clamped > 0,
                };
              }
            }
            return ch;
          })
        );
      }

      if (sharedTimer) {
        const parsedTimer = parseInt(sharedTimer, 10);
        if (!isNaN(parsedTimer) && parsedTimer > 0) {
          setSleepTimerMinutes(parsedTimer);
          setSleepTimerRemaining(parsedTimer * 60);
        }
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Generate shareable URL with sound blend configuration
  const getShareableUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.origin);
    if (activePresetId && activePresetId !== "custom") {
      url.searchParams.set("preset", activePresetId);
    } else {
      url.searchParams.set("preset", "custom");
    }
    mixerChannels.forEach((ch) => {
      if (ch.enabled && ch.volume > 0) {
        url.searchParams.set(ch.id, Math.round(ch.volume * 100).toString());
      } else if (!ch.enabled) {
        url.searchParams.set(ch.id, "0");
      }
    });
    if (sleepTimerMinutes) {
      url.searchParams.set("timer", sleepTimerMinutes.toString());
    }
    if (activeTrack && activeTrack.id) {
      url.searchParams.set("track", activeTrack.id);
    }
    return url.toString();
  }, [activePresetId, mixerChannels, sleepTimerMinutes, activeTrack]);

  // Load user custom blends from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lhobmoom_custom_blends_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomBlends(parsed);
        }
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Hydrate study stats from localStorage on mount & calculate streak
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lhobmoom_study_stats_v1");
      const todayStr = getTodayDateStr();
      if (stored) {
        const parsed: StudyStats = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          let streak = parsed.streakDays || 0;
          let todayMins = parsed.todayMinutes || 0;

          if (parsed.lastActiveDate && parsed.lastActiveDate !== todayStr) {
            const prev = new Date(parsed.lastActiveDate);
            const curr = new Date(todayStr);
            const diffDays = Math.round(
              (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
            );
            todayMins = parsed.dailyHistory?.[todayStr] || 0;
            if (diffDays > 1) {
              streak = 0;
            }
          }

          setStudyStats({
            todayMinutes: todayMins,
            totalMinutes: parsed.totalMinutes || 0,
            streakDays: streak,
            bestStreak: parsed.bestStreak || streak,
            lastActiveDate: parsed.lastActiveDate || todayStr,
            dailyHistory: parsed.dailyHistory || {},
          });
        }
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Active focus time tracking (accumulate minutes when isPlaying is true)
  useEffect(() => {
    if (!isPlaying) return;

    lastFocusTimestampRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.max(0, Math.floor((now - lastFocusTimestampRef.current) / 1000));
      if (deltaSeconds < 1) return;

      lastFocusTimestampRef.current += deltaSeconds * 1000;
      activeFocusSecondsRef.current += deltaSeconds;

      // When accumulated seconds reach 60+ seconds, convert to focus minutes
      const minutesToAdd = Math.floor(activeFocusSecondsRef.current / 60);
      if (minutesToAdd >= 1) {
        activeFocusSecondsRef.current %= 60;

        setStudyStats((prev) => {
          const todayStr = getTodayDateStr();
          const isNewDay = prev.lastActiveDate !== todayStr;

          let newStreak = prev.streakDays;
          if (isNewDay) {
            if (!prev.lastActiveDate) {
              newStreak = 1;
            } else {
              const prevDate = new Date(prev.lastActiveDate);
              const currDate = new Date(todayStr);
              const diffDays = Math.round(
                (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              if (diffDays === 1) {
                newStreak = (prev.streakDays || 0) + 1;
              } else {
                newStreak = 1;
              }
            }
          } else if (newStreak === 0) {
            newStreak = 1;
          }

          const newTodayMinutes = (isNewDay ? 0 : prev.todayMinutes) + minutesToAdd;
          const newTotalMinutes = prev.totalMinutes + minutesToAdd;
          const newBestStreak = Math.max(prev.bestStreak || 0, newStreak);
          const newHistory = {
            ...(prev.dailyHistory || {}),
            [todayStr]: newTodayMinutes,
          };

          const updated: StudyStats = {
            todayMinutes: newTodayMinutes,
            totalMinutes: newTotalMinutes,
            streakDays: newStreak,
            bestStreak: newBestStreak,
            lastActiveDate: todayStr,
            dailyHistory: newHistory,
          };

          try {
            localStorage.setItem(
              "lhobmoom_study_stats_v1",
              JSON.stringify(updated)
            );
          } catch {
            // Safe fallback
          }

          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Reset study statistics
  const resetStudyStats = useCallback(() => {
    const todayStr = getTodayDateStr();
    const initial: StudyStats = {
      todayMinutes: 0,
      totalMinutes: 0,
      streakDays: 0,
      bestStreak: 0,
      lastActiveDate: todayStr,
      dailyHistory: {},
    };
    setStudyStats(initial);
    activeFocusSecondsRef.current = 0;
    try {
      localStorage.removeItem("lhobmoom_study_stats_v1");
    } catch {
      // Safe fallback
    }
  }, []);

  // Save current mixer state as custom blend
  const saveCustomBlend = useCallback(
    (name: string, emoji: string = "🎵") => {
      const volumes = {
        rain: 0,
        whitenoise: 0,
        ambient: 0,
        waves: 0,
      };
      mixerChannels.forEach((ch) => {
        if (ch.id in volumes) {
          volumes[ch.id as keyof typeof volumes] = ch.enabled ? ch.volume : 0;
        }
      });

      const newBlend: CustomBlend = {
        id: `blend-${Date.now()}`,
        name: name.trim() || "สูตรส่วนตัวของฉัน",
        emoji: emoji || "🎵",
        createdAt: Date.now(),
        volumes,
      };

      setCustomBlends((prev) => {
        const updated = [newBlend, ...prev].slice(0, 10);
        try {
          localStorage.setItem(
            "lhobmoom_custom_blends_v1",
            JSON.stringify(updated)
          );
        } catch {
          // Safe fallback
        }
        return updated;
      });
    },
    [mixerChannels]
  );

  // Delete saved custom blend
  const deleteCustomBlend = useCallback((id: string) => {
    setCustomBlends((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem(
          "lhobmoom_custom_blends_v1",
          JSON.stringify(updated)
        );
      } catch {
        // Safe fallback
      }
      return updated;
    });
  }, []);

  // Apply user custom blend
  const applyCustomBlend = useCallback((blend: CustomBlend) => {
    setActivePresetId("custom");
    setMixerChannels((prev) =>
      prev.map((ch) => {
        const vol = blend.volumes[ch.id as keyof typeof blend.volumes];
        return {
          ...ch,
          volume: vol !== undefined ? vol : ch.volume,
          enabled: vol !== undefined ? vol > 0 : ch.enabled,
        };
      })
    );
    getOrCreateAudioContext();
    setIsPlaying(true);
  }, []);

  // Master volume change handler
  const setMasterVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setMasterVolumeState(clamped);
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = clamped;
    }
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        clamped,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  };

  // Pause audio callback
  const pause = useCallback(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }
    const ctx = audioCtxRef.current;
    if (ctx) {
      // Fade out channel volumes smoothly
      Object.values(channelNodesRef.current).forEach((node) => {
        if (node.gainNode) {
          node.gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
        }
      });
    }
    setIsPlaying(false);
  }, []);

  // Resilient audio track playback with graceful synthesized ambient fallback
  const playTrackAudio = (url?: string) => {
    if (!url) {
      setIsSynthesizerFallback(true);
      setIsLiveStream(true);
      setDuration(0);
      // Ensure synthetic ambient channels are active so sound never cuts out
      setMixerChannels((prev) =>
        prev.map((ch) =>
          ch.id === "ambient" || ch.id === "whitenoise"
            ? { ...ch, enabled: true, volume: Math.max(ch.volume, 0.4) }
            : ch
        )
      );
      return;
    }

    let audio = htmlAudioRef.current;
    if (!audio) {
      audio = new Audio();
      audio.loop = true;

      audio.addEventListener("timeupdate", () => {
        if (audio && !isNaN(audio.currentTime)) {
          setCurrentTime(audio.currentTime);
        }
      });

      const updateDuration = () => {
        const dur = audio?.duration;
        if (!dur || !isFinite(dur) || isNaN(dur) || dur <= 0) {
          setDuration(0);
          setIsLiveStream(true);
        } else {
          setDuration(dur);
          setIsLiveStream(false);
        }
      };

      audio.addEventListener("loadedmetadata", updateDuration);
      audio.addEventListener("durationchange", updateDuration);

      audio.addEventListener("playing", () => {
        setIsSynthesizerFallback(false);
        updateDuration();
      });

      audio.addEventListener("error", () => {
        console.warn(
          "LMSound: External track audio failed to load. Seamlessly switching to Web Audio Synthesizer fallback."
        );
        setIsSynthesizerFallback(true);
        setIsLiveStream(true);
        setDuration(0);
        setMixerChannels((prev) =>
          prev.map((ch) =>
            ch.id === "ambient" || ch.id === "whitenoise"
              ? { ...ch, enabled: true, volume: Math.max(ch.volume, 0.4) }
              : ch
          )
        );
      });

      htmlAudioRef.current = audio;
    }

    if (audio.src !== url) {
      audio.src = url;
      audio.loop = true;
      setCurrentTime(0);
    }

    audio.volume = masterVolume;

    audio.play().catch(() => {
      setIsSynthesizerFallback(true);
      setIsLiveStream(true);
      setDuration(0);
      setMixerChannels((prev) =>
        prev.map((ch) =>
          ch.id === "ambient" || ch.id === "whitenoise"
            ? { ...ch, enabled: true, volume: Math.max(ch.volume, 0.4) }
            : ch
        )
      );
    });
  };

  const retryAudioSource = () => {
    if (activeTrack.audioUrl) {
      playTrackAudio(activeTrack.audioUrl);
    }
  };

  // Seek position in seconds
  const seek = useCallback(
    (seconds: number) => {
      if (isLiveStream || duration <= 0) {
        setCurrentTime(Math.max(0, seconds));
        return;
      }
      const clamped = Math.max(0, Math.min(duration, seconds));
      setCurrentTime(clamped);
      if (htmlAudioRef.current && isFinite(clamped)) {
        try {
          htmlAudioRef.current.currentTime = clamped;
        } catch {}
      }
    },
    [duration, isLiveStream]
  );

  // Skip forward or backward by deltaSeconds
  const skipTime = useCallback(
    (deltaSeconds: number) => {
      seek(currentTime + deltaSeconds);
    },
    [currentTime, seek]
  );

  // Live session timer when streaming or in Web Audio synthesizer mode
  useEffect(() => {
    if (!isPlaying || (!isSynthesizerFallback && activeTrack.audioUrl && !isLiveStream)) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isSynthesizerFallback, activeTrack.audioUrl, isLiveStream]);

  // Play audio
  const play = () => {
    getOrCreateAudioContext();
    setIsPlaying(true);
    playTrackAudio(activeTrack.audioUrl);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Sleep & Focus Timer Setter
  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null || minutes <= 0) {
      setSleepTimerRemaining(null);
      // Restore natural master volume immediately
      if (htmlAudioRef.current) {
        htmlAudioRef.current.volume = masterVolume;
      }
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setValueAtTime(
          masterVolume,
          audioCtxRef.current.currentTime
        );
      }
    } else {
      setSleepTimerRemaining(minutes * 60);
    }
  };

  // Sleep Timer Countdown & Smooth 30s Fade-Out
  useEffect(() => {
    if (!isPlaying || sleepTimerRemaining === null || sleepTimerRemaining <= 0) return;

    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          pause();
          setSleepTimerMinutes(null);
          // Restore regular master volume so next play is not muted
          if (htmlAudioRef.current) {
            htmlAudioRef.current.volume = masterVolume;
          }
          if (masterGainRef.current && audioCtxRef.current) {
            masterGainRef.current.gain.setValueAtTime(
              masterVolume,
              audioCtxRef.current.currentTime
            );
          }
          return null;
        }

        const next = prev - 1;
        // In the final 30 seconds, fade out gradually
        if (next <= 30) {
          const fadeRatio = Math.max(0, next / 30);
          const faded = masterVolume * fadeRatio;
          if (htmlAudioRef.current) {
            htmlAudioRef.current.volume = faded;
          }
          if (masterGainRef.current && audioCtxRef.current) {
            masterGainRef.current.gain.setValueAtTime(
              faded,
              audioCtxRef.current.currentTime
            );
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, sleepTimerRemaining, masterVolume, pause]);

  // Trigger Tibetan Zen Bell Chime
  const playChime = useCallback(() => {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const dest = masterGainRef.current || ctx.destination;
    playZenBellChime(ctx, dest);
  }, [getOrCreateAudioContext]);

  // Start Pomodoro Focus Cycle
  const startPomodoro = useCallback(
    (presetId?: string) => {
      const selectedId = presetId || pomodoroPresetId;
      const preset =
        POMODORO_PRESETS.find((p) => p.id === selectedId) || POMODORO_PRESETS[0];
      setPomodoroPresetId(selectedId);
      setPomodoroPhase("focus");
      const seconds = preset.focusMinutes * 60;
      setPomodoroSecondsLeft(seconds);
      setPomodoroTotalSeconds(seconds);

      // Ring chime to mark start of session
      playChime();

      // Ensure audio is playing for focus
      if (!isPlaying) {
        getOrCreateAudioContext();
        setIsPlaying(true);
        playTrackAudio(activeTrack.audioUrl);
      }
    },
    [pomodoroPresetId, playChime, isPlaying, activeTrack.audioUrl, getOrCreateAudioContext]
  );

  // Stop Pomodoro
  const stopPomodoro = useCallback(() => {
    setPomodoroPhase("idle");
    setPomodoroSecondsLeft(null);
    setPomodoroTotalSeconds(null);
  }, []);

  // Skip between focus and break phases
  const skipPomodoroPhase = useCallback(() => {
    const preset =
      POMODORO_PRESETS.find((p) => p.id === pomodoroPresetId) ||
      POMODORO_PRESETS[0];
    playChime();
    if (pomodoroPhase === "focus") {
      setPomodoroPhase("break");
      const breakSecs = preset.breakMinutes * 60;
      setPomodoroSecondsLeft(breakSecs);
      setPomodoroTotalSeconds(breakSecs);
    } else {
      setPomodoroPhase("focus");
      const focusSecs = preset.focusMinutes * 60;
      setPomodoroSecondsLeft(focusSecs);
      setPomodoroTotalSeconds(focusSecs);
    }
  }, [pomodoroPhase, pomodoroPresetId, playChime]);

  // Pomodoro Countdown Cycle Loop
  useEffect(() => {
    if (
      pomodoroPhase === "idle" ||
      pomodoroSecondsLeft === null ||
      pomodoroSecondsLeft <= 0
    ) {
      return;
    }

    const interval = setInterval(() => {
      setPomodoroSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          playChime();
          const preset =
            POMODORO_PRESETS.find((p) => p.id === pomodoroPresetId) ||
            POMODORO_PRESETS[0];

          if (pomodoroPhase === "focus") {
            // Switch from focus to break
            setPomodoroPhase("break");
            const breakSecs = preset.breakMinutes * 60;
            setPomodoroTotalSeconds(breakSecs);
            return breakSecs;
          } else {
            // Switch from break back to focus
            setPomodoroPhase("focus");
            const focusSecs = preset.focusMinutes * 60;
            setPomodoroTotalSeconds(focusSecs);
            return focusSecs;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoroPhase, pomodoroSecondsLeft, pomodoroPresetId, playChime]);

  // Switch Track and update mixer channels accordingly
  const selectTrack = (trackId: string) => {
    const found = PRESET_TRACKS.find((t) => t.id === trackId);
    if (!found) return;

    setActiveTrack(found);
    setActivePresetId(null);
    setIsNowPlayingOpen(true);
    addToRecentlyPlayed(found);

    // Apply track's preset channel volumes
    if (found.channelVolumes) {
      setMixerChannels((prev) =>
        prev.map((ch) => ({
          ...ch,
          volume:
            found.channelVolumes?.[ch.id] !== undefined
              ? found.channelVolumes[ch.id]
              : ch.volume,
          enabled: true,
        }))
      );
    }

    getOrCreateAudioContext();
    setIsPlaying(true);
    playTrackAudio(found.audioUrl);
  };

  // Play any spot directly from Feed or Banner
  const playSpot = (track: AudioTrack) => {
    setActiveTrack(track);
    setActivePresetId(null);
    setIsNowPlayingOpen(true);
    addToRecentlyPlayed(track);
    getOrCreateAudioContext();
    setIsPlaying(true);
    playTrackAudio(track.audioUrl);
  };

  const nextTrack = () => {
    const currentIndex = PRESET_TRACKS.findIndex((t) => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % PRESET_TRACKS.length;
    selectTrack(PRESET_TRACKS[nextIndex].id);
  };

  const prevTrack = () => {
    const currentIndex = PRESET_TRACKS.findIndex((t) => t.id === activeTrack.id);
    const prevIndex =
      (currentIndex - 1 + PRESET_TRACKS.length) % PRESET_TRACKS.length;
    selectTrack(PRESET_TRACKS[prevIndex].id);
  };

  // Adjust specific mixer channel volume (Switches mode to custom)
  const setChannelVolume = (channelId: string, volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setActivePresetId("custom");
    setMixerChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, volume: clamped } : ch))
    );
  };

  // Toggle specific channel on/off (Switches mode to custom)
  const toggleChannel = (channelId: string) => {
    setActivePresetId("custom");
    setMixerChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch
      )
    );
  };

  // 1-Click Ambience Preset / Focus Recipe Applicator
  const applyAmbiencePreset = (presetId: string) => {
    const preset = FOCUS_RECIPES.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    setMixerChannels((prev) =>
      prev.map((ch) => {
        const vol = preset.volumes[ch.id as keyof typeof preset.volumes];
        return {
          ...ch,
          volume: vol !== undefined ? vol : ch.volume,
          enabled: vol !== undefined ? vol > 0 : ch.enabled,
        };
      })
    );

    getOrCreateAudioContext();
    setIsPlaying(true);
  };

  const applyFocusRecipe = applyAmbiencePreset;

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        masterVolume,
        activeTrack,
        tracks: PRESET_TRACKS,
        focusRecipes: FOCUS_RECIPES,
        mixerChannels,
        isMixerOpen,
        isNowPlayingOpen,
        activePresetId,
        sleepTimerMinutes,
        sleepTimerRemaining,
        isSynthesizerFallback,
        recentlyPlayed,
        customBlends,
        currentTime,
        duration,
        isLiveStream,
        acousticMode,
        acousticSpaces: ACOUSTIC_SPACES,
        binauralMode,
        binauralVolume,
        binauralPresets: BINAURAL_PRESETS,
        eqPresetId,
        eqBands,
        eqPresets: EQ_PRESETS,
        pomodoroPhase,
        pomodoroPresetId,
        pomodoroSecondsLeft,
        pomodoroTotalSeconds,
        pomodoroPresets: POMODORO_PRESETS,
        seek,
        skipTime,
        setAcousticSpace,
        setBinauralMode,
        setBinauralVolume,
        setEqPreset,
        setEqBand,
        resetEq,
        startPomodoro,
        stopPomodoro,
        skipPomodoroPhase,
        playChime,
        setSleepTimer,
        retryAudioSource,
        clearRecentlyPlayed,
        getShareableUrl,
        saveCustomBlend,
        deleteCustomBlend,
        applyCustomBlend,
        togglePlay,
        play,
        pause,
        setMasterVolume,
        selectTrack,
        playSpot,
        nextTrack,
        prevTrack,
        setChannelVolume,
        toggleChannel,
        applyAmbiencePreset,
        applyFocusRecipe,
        studyStats,
        isStatsModalOpen,
        setIsStatsModalOpen,
        resetStudyStats,
        setIsMixerOpen,
        setIsNowPlayingOpen,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
