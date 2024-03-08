import React, { useState, useRef } from 'react'
import meyda from 'meyda';

import { Button } from '@mui/material';

import './App.css'
import { MeydaAnalyzer } from 'meyda/dist/esm/meyda-wa';

import { AnalyzeFile } from './components/AnalyzeFile';

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

    audioContext.current?.resume();

    if (!isRecording) {
      try {
        let stream: MediaStream | null = null;
        let source: MediaStreamAudioSourceNode | null = null;


        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.current.createMediaStreamSource(stream);
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
      console.log('Stop recording called');
      if (mediaStream) {
        mediaStream.disconnect();
        audioContext.current?.suspend();
        console.log('Media Stream Disconnect called');
      }
      if (meydaAnalyzer) {
        meydaAnalyzer.stop();
        console.log('Meyda stop called');
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
      <AnalyzeFile setRms={setRms} setSpectral={setSpectral} />
    </div>
  )
}