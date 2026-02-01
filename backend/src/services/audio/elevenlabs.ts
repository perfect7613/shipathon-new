import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { supabase } from '../../lib/supabase.js';
import { env } from '../../config/env.js';

const elevenlabs = new ElevenLabsClient({
  apiKey: env.ELEVENLABS_API_KEY
});

// Ensure audio bucket exists
async function ensureAudioBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const audioBucket = buckets?.find(b => b.name === 'audio');

  if (!audioBucket) {
    console.log('Creating audio storage bucket...');
    const { error } = await supabase.storage.createBucket('audio', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav']
    });

    if (error) {
      console.error('Failed to create audio bucket:', error);
      throw error;
    }
    console.log('Audio bucket created successfully');
  }
}

// Available voice IDs (get actual IDs from ElevenLabs dashboard)
const VOICES = {
  professional: 'pNInz6obpgDQGcFmaJgB',  // Adam - Standard American Male (Free Tier Compatible)
  casual: 'EXAVITQu4vr4xnSDxMaL',         // Bella - casual female
  authoritative: 'VR6AewLTigWG4xSOukaG',  // Arnold - authoritative male
} as const;

type VoiceStyle = keyof typeof VOICES;

export interface NarrationResult {
  url: string;
  filename: string;
}

export async function generateNarration(
  text: string,
  options: {
    voiceStyle?: VoiceStyle;
    stability?: number;
    similarityBoost?: number;
  } = {}
): Promise<NarrationResult> {
  const voiceId = VOICES[options.voiceStyle || 'professional'];

  console.log(`Generating narration with voice: ${options.voiceStyle || 'professional'}`);

  // Generate audio with custom voice settings
  const audio = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId: 'eleven_multilingual_v2',
    voiceSettings: {
      stability: options.stability ?? 0.5,
      similarityBoost: options.similarityBoost ?? 0.75,
      style: 0.5,
      useSpeakerBoost: true
    },
    outputFormat: 'mp3_44100_128'
  });

  // Convert stream/blob to buffer
  let buffer: Buffer;

  if (audio instanceof Blob) {
    const arrayBuffer = await audio.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else if (audio instanceof ReadableStream) {
    const chunks: Uint8Array[] = [];
    const reader = audio.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    buffer = Buffer.concat(chunks);
  } else {
    // Assume it's already a buffer-like object
    buffer = Buffer.from(audio as ArrayBuffer);
  }

  // Ensure bucket exists
  await ensureAudioBucket();

  // Upload to Supabase Storage
  const filename = `narration-${Date.now()}.mp3`;
  const { error } = await supabase.storage
    .from('audio')
    .upload(filename, buffer, {
      contentType: 'audio/mpeg',
      upsert: false
    });

  if (error) {
    console.error('Error uploading audio:', error);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('audio')
    .getPublicUrl(filename);

  console.log(`Narration generated: ${filename}`);

  return {
    url: urlData.publicUrl,
    filename
  };
}

// Generate with timestamps for video sync
export async function generateNarrationWithTimestamps(
  text: string,
  voiceStyle: VoiceStyle = 'professional'
) {
  const voiceId = VOICES[voiceStyle];

  const response = await elevenlabs.textToSpeech.convertWithTimestamps(voiceId, {
    text,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128'
  });

  return {
    audioBase64: response.audioBase64,
    alignment: response.alignment,
  };
}

// Streaming for real-time playback (lower latency)
export async function streamNarration(
  text: string,
  voiceStyle: VoiceStyle = 'professional'
) {
  const voiceId = VOICES[voiceStyle];

  return elevenlabs.textToSpeech.stream(voiceId, {
    text,
    modelId: 'eleven_flash_v2_5',
    optimizeStreamingLatency: 3,
  });
}

// Get available voices
export async function getVoices() {
  const voices = await elevenlabs.voices.getAll();
  return voices;
}
