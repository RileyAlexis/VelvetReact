import React, { useState, useRef, useEffect } from 'react'
import meyda from 'meyda';

import { Button } from '@mui/material';

import './App.css'
import { MeydaAnalyzer } from 'meyda/dist/esm/meyda-wa';

//Components
import { AnalyzeFile } from './components/AnalyzeFile';
import { SpectralChart } from './components/SpectralChart';
import { SpectralPlot } from './components/SpectralPlot';

export const App: React.FC = () => {

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const audioContext = useRef<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStreamAudioSourceNode | null>(null);
  const [meydaAnalyzer, setMeydaAnalyzer] = useState<MeydaAnalyzer | null>(null);

  const [rms, setRms] = useState<number | null>(null);
  const [spectral, setSpectral] = useState<number>(0);
  const [spectralArray, setSpectralArray] = useState<number[]>([]);

  let spectralSmall: number[] = [];

  const startRecording = () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
      startAnalyzer();
    }
    if (audioContext) {
      startAnalyzer();
    }
    if (isRecording) {

    }
  }

  const startAnalyzer = async () => {

    audioContext.current?.resume();

    if (!isRecording) {
      try {
        let stream: MediaStream | null = null;
        let source: MediaStreamAudioSourceNode | null = null;


        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.current?.createMediaStreamSource(stream);
        setMediaStream(source);

        const analyzer = meyda.createMeydaAnalyzer({
          audioContext: audioContext.current,
          source: source,
          bufferSize: 512,
          featureExtractors: ['rms', 'spectralCentroid'],
          callback: (features: Meyda.MeydaFeaturesObject) => {
            setRms(features.rms);
            setSpectral(features.spectralCentroid);
            //Limits spectral array to previous 1000 values
            spectralSmall.push(features.spectralCentroid);
            if (spectralSmall.length > 30) {
              let arrayAverage: number = 0;
              for (let i = 0; i < spectralSmall.length; i++) {
                arrayAverage += spectralSmall[i];
              }
              spectralSmall = [];
              setSpectralArray((prevValues) => {
                const newValues = [...prevValues, (arrayAverage / 30)];
                return newValues.slice(Math.max(newValues.length - 100, 0));
              })
            }
          }

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
        // mediaStream.disconnect();
        audioContext.current?.suspend();
        // console.log('Media Stream Disconnect called');
      }
      if (meydaAnalyzer) {
        meydaAnalyzer.stop();
        console.log('Meyda stop called');
      }
      setIsRecording(false);
    }
  };

  // useEffect(() => {
  //   if (isRecording) {

  //     }
  //   }
  // }, [spectralSmall])

  useEffect(() => {
    // console.log('Spectral Array length', spectralArray[spectralArray.length - 1]);
  }, [spectralArray])

  return (
    <div>
      <Button onMouseDown={startRecording}>Mic {JSON.stringify(isRecording)}</Button>
      <br />
      <span>RMS: {rms}</span>
      <br />
      <span>Spectral Centroid: {spectral}</span>
      <AnalyzeFile setRms={setRms} setSpectral={setSpectral} />
      {/* ∫<div className='chart'>
        <SpectralChart spectral={spectral} />
      </div> */}
      <div>
        <SpectralPlot spectralArray={spectralArray} rms={rms} />
      </div>
    </div>
  )
}