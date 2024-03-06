import React, { useState, useRef } from 'react'
import meyda from 'meyda';

import { Button } from '@mui/material';

import './App.css'
import { MeydaAnalyzer } from 'meyda/dist/esm/meyda-wa';

export const App: React.FC = () => {

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const audioContext = useRef<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStreamAudioSourceNode | null>(null);
  const [meydaAnalyzer, setMeydaAnalyzer] = useState<MeydaAnalyzer | null>(null);
  const [rms, setRms] = useState<number | null>(null);
  const [spectral, setSpectral] = useState<number | null>(null);

  const startRecording = () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
      startAnalyzer();
    }
    if (audioContext) {
      startAnalyzer();
    }

  }

  const startAnalyzer = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.current.createMediaStreamSource(stream);
        setMediaStream(source);

        const analyzer = meyda.createMeydaAnalyzer({
          audioContext: audioContext.current,
          source: source,
          bufferSize: 512,
          featureExtractors: ['rms', 'spectralCentroid'],
          callback: (features: Meyda.MeydaFeaturesObject) => {
            setRms(features.rms);
            setSpectral(features.spectralCentroid);
          },
        });
        analyzer.start();
        setMeydaAnalyzer(analyzer);

        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      if (mediaStream) {
        mediaStream.disconnect();
      }
      if (meydaAnalyzer) {
        meydaAnalyzer.stop();
      }
      setIsRecording(false);
    }
  };

  return (
    <div>
      <Button onMouseDown={startRecording}>Mic {JSON.stringify(isRecording)}</Button>
      <br />
      <span>RMS: {rms}</span>
      <br />
      <span>Spectral Centroid: {spectral}</span>
    </div>
  )
}