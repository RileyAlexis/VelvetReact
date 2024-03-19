import React, { useState, useRef, useEffect } from 'react'
import meyda from 'meyda';

import { Button } from '@mui/material';

import './App.css'
import { MeydaAnalyzer } from 'meyda/dist/esm/meyda-wa';

//Components
import { AnalyzeFile } from './components/AnalyzeFile';
import { SpectralChart } from './components/SpectralChart';
import { SpectralPlot } from './components/SpectralPlot';

interface appOptions {
  averageTicks: number,
  plotHorizAxis: number,
  showSpectral: boolean,
  colorSpectral: string,
  showRms: boolean,
  colorRms: string,
}


export const App: React.FC = () => {

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const audioContext = useRef<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStreamAudioSourceNode | null>(null);
  const [meydaAnalyzer, setMeydaAnalyzer] = useState<MeydaAnalyzer | null>(null);

  const [rms, setRms] = useState<number | null>(null);
  const [rmsArray, setRmsArray] = useState<number[]>([]);
  const [spectral, setSpectral] = useState<number>(0);
  const [spectralArray, setSpectralArray] = useState<number[]>([]);
  const [audioData, setAudioData] = useState<object[]>([{}]);

  const [appOptions, setAppOptions] = useState<appOptions>({
    averageTicks: 30,
    plotHorizAxis: 100,
    showSpectral: true,
    colorSpectral: '#fa9ef2',
    showRms: true,
    colorRms: '#f2fa9e'
  })

  let rmsSmall: number[] = [];
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

  const calculateAnalyser = (features: Meyda.MeydaFeaturesObject) => {
    //Averages spectral centroid over 30 ticks then limits display to previous 100
    spectralSmall.push(features.spectralCentroid);
    rmsSmall.push((features.rms) * 1000);

    let spectralAverage: number = 0;
    let rmsAverage: number = 0;

    if (spectralSmall.length > appOptions.averageTicks) {
      for (let i = 0; i < spectralSmall.length; i++) {
        spectralAverage += spectralSmall[i];
      }

      if (rmsSmall.length > appOptions.averageTicks) {
        for (let i = 0; i < rmsSmall.length; i++) {
          rmsAverage += rmsSmall[i];
        }
      }
      spectralSmall = [];
      rmsSmall = [];

      setSpectralArray((prevValues) => {
        const newValues = [...prevValues, (spectralAverage / appOptions.averageTicks)];
        return newValues.slice(Math.max(newValues.length - 100, 0));
      });

      setRmsArray((prevValues) => {
        const newValues = [...prevValues, (rmsAverage / appOptions.averageTicks)];
        return newValues.slice(Math.max(newValues.length - 100, 0));
      });
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
            // setRms(features.rms);
            // setSpectral(features.spectralCentroid);
            calculateAnalyser(features);
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


  useEffect(() => {
    // console.log('Spectral Array length', spectralArray[spectralArray.length - 1]);
  }, [spectralArray]);

  const handleShowRms = () => {
    setAppOptions(prevOptions => ({
      ...prevOptions,
      showRms: !appOptions.showRms
    }))
  }

  return (
    <div>
      <Button onMouseDown={startRecording}>Mic {JSON.stringify(isRecording)}</Button>
      <br />
      <span>RMS: {rms}</span>
      <br />
      <span>Spectral Centroid: {spectral}</span>
      <AnalyzeFile
        appOptions={appOptions}
        setRms={setRms}
        setSpectral={setSpectral}
        calculateAnalyzer={calculateAnalyser} />

      {/* ∫<div className='chart'>
        <SpectralChart spectral={spectral} />
      </div> */}

      <div style={{ padding: '10px' }}>
        <input type='checkbox' onChange={handleShowRms} checked={appOptions.showRms} />
        <label>Show Levels</label>
      </div>


      <div>
        <SpectralPlot
          appOptions={appOptions}
          spectralArray={spectralArray}
          rmsArray={rmsArray} />
      </div>


    </div>
  )
}