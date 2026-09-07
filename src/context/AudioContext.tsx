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

export interface PresetTrack {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  channelVolumes: Record<string, number>;
}

export const PRESET_TRACKS: PresetTrack[] = [
  {
    id: "midnight-rain",
    title: "Midnight Rain & Thunder",
    subtitle: "ฝนตกยามค่ำคืนและเสียงสายลม",
    category: "Rain & Storm",
    channelVolumes: { rain: 0.8, whitenoise: 0.2, ambient: 0.4, waves: 0.1 },
  },
  {
    id: "deep-focus-study",
    title: "Deep Focus Workspace",
    subtitle: "คลื่นเสียงเสริมสมาธิและการอ่านหนังสือ",
    category: "Focus & Flow",
    channelVolumes: { rain: 0.2, whitenoise: 0.7, ambient: 0.5, waves: 0.0 },
  },
  {
    id: "coastal-waves",
    title: "Ocean Shore Breeze",
    subtitle: "เกลียวคลื่นซัดหาดทรายและสายลมชายฝั่ง",
    category: "Nature & Chill",
    channelVolumes: { rain: 0.1, whitenoise: 0.15, ambient: 0.5, waves: 0.85 },
  },
  {
    id: "peaceful-meditation",
    title: "Zen Temple Ambience",
    subtitle: "บรรยากาศสงบนิ่งเพื่อการผ่อนคลายจิตใจ",
    category: "Meditation & Sleep",
    channelVolumes: { rain: 0.35, whitenoise: 0.2, ambient: 0.8, waves: 0.2 },
  },
];

interface AudioContextType {
  isPlaying: boolean;
  masterVolume: number;
  activeTrack: PresetTrack;
  tracks: PresetTrack[];
  mixerChannels: MixerChannel[];
  isMixerOpen: boolean;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  setMasterVolume: (vol: number) => void;
  selectTrack: (trackId: string) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setChannelVolume: (channelId: string, volume: number) => void;
  toggleChannel: (channelId: string) => void;
  setIsMixerOpen: (open: boolean) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolumeState] = useState(0.75);
  const [activeTrack, setActiveTrack] = useState<PresetTrack>(PRESET_TRACKS[0]);
  const [isMixerOpen, setIsMixerOpen] = useState(false);

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

  // Audio nodes refs for persistent sound generation
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
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
      masterGain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;

      // Initialize synthesizer channels
      initSynthesizers(ctx, masterGain);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, [masterVolume]);

  // Create Web Audio generators for each sound channel
  const initSynthesizers = (ctx: AudioContext, masterGain: GainNode) => {
    // 1. Rain Synthesizer (Filtered Noise with droplet modulation)
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0, ctx.currentTime);
    rainGain.connect(masterGain);

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
    noiseGain.connect(masterGain);

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
    ambientGain.connect(masterGain);

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
    wavesGain.connect(masterGain);

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
  };

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

  // Master volume change handler
  const setMasterVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setMasterVolumeState(clamped);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        clamped,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  };

  // Play audio
  const play = () => {
    getOrCreateAudioContext();
    setIsPlaying(true);
  };

  // Pause audio
  const pause = () => {
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
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Switch Track and update mixer channels accordingly
  const selectTrack = (trackId: string) => {
    const found = PRESET_TRACKS.find((t) => t.id === trackId);
    if (!found) return;

    setActiveTrack(found);

    // Apply track's preset channel volumes
    setMixerChannels((prev) =>
      prev.map((ch) => ({
        ...ch,
        volume:
          found.channelVolumes[ch.id] !== undefined
            ? found.channelVolumes[ch.id]
            : ch.volume,
        enabled: true,
      }))
    );

    if (!isPlaying) {
      play();
    }
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

  // Adjust specific mixer channel volume
  const setChannelVolume = (channelId: string, volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setMixerChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, volume: clamped } : ch))
    );
  };

  // Toggle specific channel on/off
  const toggleChannel = (channelId: string) => {
    setMixerChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch
      )
    );
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        masterVolume,
        activeTrack,
        tracks: PRESET_TRACKS,
        mixerChannels,
        isMixerOpen,
        togglePlay,
        play,
        pause,
        setMasterVolume,
        selectTrack,
        nextTrack,
        prevTrack,
        setChannelVolume,
        toggleChannel,
        setIsMixerOpen,
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
