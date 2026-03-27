'use server';
/**
 * @fileOverview A text-to-speech AI agent using Gemini.
 *
 * - textToSpeech - A function that handles the text synthesis.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import wav from 'wav';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  language: z.enum(['Hindi', 'English']).describe('The language of the text.'),
});

export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  media: z.string().describe('The synthesized audio as a base64 encoded data URI.'),
});

export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      let bufs = [] as any[];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
  }

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    if (!input.text.trim()) {
      return { media: '' };
    }

    // The Gemini TTS model uses generic voice names. The model should auto-detect the language.
    const voiceName = input.language === 'Hindi' ? 'Achernar' : 'Algenib';

    try {
        const { media } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
            },
            prompt: input.text,
          });

      if (!media || !media.url) {
        throw new Error('No media returned from TTS model');
      }

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      
      const wavBase64 = await toWav(audioBuffer);

      return {
        media: `data:audio/wav;base64,${wavBase64}`,
      };
    } catch (error) {
        console.error('Failed to synthesize speech with Gemini TTS:', error);
        if (error instanceof Error) {
            throw new Error(`Gemini TTS failed: ${error.message}`);
        }
        throw new Error('An unknown error occurred during Gemini TTS synthesis.');
    }
  }
);
