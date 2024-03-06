import { useState, useEffect } from 'react'
import meyda from 'meyda';

import { Button } from '@mui/material';

import './App.css'
import { MeydaAnalyzer } from 'meyda/dist/esm/meyda-wa';

export const App: React.FC = () => {

  const [isMicOpen, setIsMicOpen] = useState<boolean>(false);
  const [rms, setRms] = useState<number | null>(null);
  const [spectral, setSpectral] = useState<number | null>(null);
  const audioContext: AudioContext = new AudioContext();

  const openAudioContext = (): void => {

    if (audioContext.state === 'suspended') {

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream: MediaStream) => {
          //Use the stream here
          const micStream = audioContext.createMediaStreamSource(stream);

          meydaAnalyzers(micStream, 'start');
          console.log('Microphone activated');
        }).catch((error) => {
          console.error(error);
        })
    } else if (audioContext.state !== 'suspended') {
      audioContext.suspend();
      console.log('Microphone suspended');
      meydaAnalyzers('', 'stop');
    }
  }

  function meydaAnalyzers(sourceStream: MediaStream) {

    if (typeof meyda === "undefined") {
      console.log("Meyda could not be found! Have you included it?");
    } else {
      const analyzer: MeydaAnalyzer = meyda.createMeydaAnalyzer({
        audioContext: audioContext,
        source: sourceStream,
        bufferSize: 512,
        featureExtractors: ["rms", "amplitudeSpectrum", "spectralCentroid"],
        callback: (features) => {

          setRms(features.rms);
          setSpectral(features.spectralCentroid);
          //console.log(features.amplitudeSpectrum); //float32 array
          // audioLevels.innerHTML = features.rms * 1000;
          // spectralCentroid.textContent = features.spectralCentroid;
        },
      });
      analyzer.start();

      console.log('Starting Analyzer');
    }
  }

  const handleMicOpen = () => {
    setIsMicOpen(prev => !prev);
    openAudioContext();
  }

  return (
    <div>
      <Button onMouseDown={handleMicOpen}>Mic {JSON.stringify(isMicOpen)}</Button>
      <br />
      <span>RMS: {rms}</span>
      <br />
      <span>Spectral Centroid: {spectral}</span>
    </div>
  )
}