import React, { useState, useRef, useEffect, useCallback } from 'react'
import meyda from 'meyda';

import { Button } from '@mui/material';

import './App.css'
import { MeydaAnalyzer } from 'meyda/dist/esm/meyda-wa';

//Components
import { SpectralPlot } from './components/SpectralPlot';

//Interfaces
import { AppOptions } from './interfaces';


export const App: React.FC = () => {

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const audioContext = useRef<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStreamAudioSourceNode | null>(null);
  const [meydaAnalyzer, setMeydaAnalyzer] = useState<MeydaAnalyzer | null>(null);

  const [rmsArray, setRmsArray] = useState<number[]>([]);
  const [spectralArray, setSpectralArray] = useState<number[]>([]);
  const [perceptualSpreadArray, setPerceptualSpreadArray] = useState<number[]>([]);

  const [appOptions, setAppOptions] = useState<AppOptions>({
    averageTicks: 30,
    plotHorizAxis: 100,
    showSpectral: true,
    colorSpectral: '#fa9ef2',
    showRms: true,
    colorRms: '#f2fa9e',
    showPerceptual: true,
    colorPerceptual: '#fff',
    dataLength: 1000,
  })

  const averageTicksRef = useRef(appOptions.averageTicks);
  const dataLengthRef = useRef(appOptions.dataLength);

  let rmsSmall: number[] = [];
  let spectralSmall: number[] = [];
  let perceptualSpreadSmall: number[] = [];
  // let amplitudeSpectrum: Float32Array[] = [];

  // const amplitudeSpectrumRef = useRef(amplitudeSpectrum);

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

  const movingWindowFilter = useCallback((data: number[]) => {
    const dataSum = [0];
    for (let i = 0; i < data.length; i++) {
      dataSum[i + 1] = dataSum[i] + data[i];
    }

    return dataSum.slice(30).map((value, index) =>
      (value - dataSum[index]) / averageTicksRef.current);
  }, [appOptions]);

  const startAnalyzer = async () => {

    audioContext.current?.resume();

    if (!isRecording) {
      try {
        let stream: MediaStream | null = null;
        let source: MediaStreamAudioSourceNode | null = null;

        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.current?.createMediaStreamSource(stream);

        //Bandpass filter reduces non-voice frequencies
        const bandpass = audioContext.current.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 3000;
        bandpass.Q.value = 1;

        //Set low pass filter to reduce noise
        const lowpass = audioContext.current.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 2000; // Set the cutoff frequency

        const highpass = audioContext.current.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 300;



        //Connect filters to audiocontext
        source.connect(bandpass);
        bandpass.connect(lowpass);
        lowpass.connect(highpass);
        // highpass.connect(analyzer);

        setMediaStream(source);

        const analyzer = meyda.createMeydaAnalyzer({
          audioContext: audioContext.current,
          source: highpass,
          bufferSize: 512,
          featureExtractors: ['rms', 'spectralCentroid', 'perceptualSpread'],
          callback: (features: Meyda.MeydaFeaturesObject) => {

            //First 5 values on spectralCentroid and perceptualSpread are NaN
            //If statement ensures the data shows on the graph immediately instead of
            //after 30 updates
            if (features.spectralCentroid) spectralSmall.push(features.spectralCentroid);
            rmsSmall.push(features.rms * 500);
            if (features.perceptualSpread) perceptualSpreadSmall.push(features.perceptualSpread * 50);

            if (spectralSmall.length >= dataLengthRef.current) {
              spectralSmall = spectralSmall.slice(-dataLengthRef.current);
            }
            if (rmsSmall.length >= dataLengthRef.current) {
              rmsSmall = rmsSmall.slice(-dataLengthRef.current);
            }
            if (perceptualSpreadSmall.length >= dataLengthRef.current) {
              perceptualSpreadSmall = perceptualSpreadSmall.slice(-dataLengthRef.current);
            }

            setSpectralArray(movingWindowFilter(spectralSmall));
            setRmsArray(movingWindowFilter(rmsSmall));
            setPerceptualSpreadArray(movingWindowFilter(perceptualSpreadSmall));
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
    averageTicksRef.current = appOptions.averageTicks;
    dataLengthRef.current = appOptions.dataLength;
  }, [appOptions.averageTicks, appOptions.dataLength]);

  const handleShowRms = () => {
    setAppOptions(prevOptions => ({
      ...prevOptions,
      showRms: !appOptions.showRms
    }))
  };

  const handleSetTicks = (ticks: number) => {
    setAppOptions(prevOptions => ({
      ...prevOptions,
      dataLength: ticks
    }))
  }

  return (
    <div>
      <Button onMouseDown={startRecording}>Mic {JSON.stringify(isRecording)}</Button>
      <br />
      <span>RMS: {rmsArray[rmsArray.length - 1]}</span>
      <br />
      <span>Spectral Centroid: {spectralArray[spectralArray.length - 1]}</span>
      <br />
      <span>Perceptual Spread: {perceptualSpreadArray[perceptualSpreadArray.length - 1]}</span>
      {/* <AnalyzeFile
        // appOptions={appOptions}
        setRms={setRms}
        setSpectral={setSpectral}
        calculateAnalyzer={calculateAnalyser} /> */}

      <div style={{ padding: '10px' }}>
        <input type='checkbox' onChange={handleShowRms} checked={appOptions.showRms} />
        <label>Show Levels</label>
        <input type='range' min={200} max={10000} onChange={(e) => handleSetTicks(parseInt(e.target.value))} value={appOptions.dataLength} />
        <label> Chart Zoom : {appOptions.dataLength}</label>
      </div>


      <div>
        <SpectralPlot
          appOptions={appOptions}
          spectralArray={spectralArray}
          rmsArray={rmsArray}
          perceptualSpreadArray={perceptualSpreadArray}
        />
      </div>


    </div>
  )
}