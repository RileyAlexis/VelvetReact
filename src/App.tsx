import React, { useState, useRef, useEffect, useCallback } from 'react'
import meyda from 'meyda';
import { yin } from './yinIFFEE.js';

//Material UI
// import { useMediaQuery } from "@mui/material";

import './App.css'

//Types
import { MeydaAnalyzer } from 'meyda/dist/esm/meyda-wa';

//Components
import { SpectralPlot } from './components/SpectralPlot';
import { BottomNav } from './components/BottomNav';

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
  // const [powerSpectrumArray, setPowerSpectrumArray] = useState<Float32Array | undefined>(undefined);
  const [yinFrequencyArray, setYinFrequencyArray] = useState<number[]>([]);


  // const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const [appOptions, setAppOptions] = useState<AppOptions>({
    averageTicks: 30,
    plotHorizAxis: 100,
    showSpectral: true,
    colorSpectral: '#fa9ef2',
    showRms: true,
    colorRms: '#f2fa9e',
    showPerceptual: true,
    colorPerceptual: '#fff',
    showYin: true,
    colorYin: '#7ee86d',
    dataLength: 1000,
  })

  const averageTicksRef = useRef(appOptions.averageTicks);
  const dataLengthRef = useRef(appOptions.dataLength);

  let rmsSmall: number[] = [];
  let spectralSmall: number[] = [];
  let perceptualSpreadSmall: number[] = [];
  let yinFrequencySmall: number[] = [];
  // let amplitudeSpectrum: Float32Array[] = [];

  // const amplitudeSpectrumRef = useRef(amplitudeSpectrum);

  const startRecording = () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
      startAnalyzer();
    }
    if (audioContext.current) {
      startAnalyzer();
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
        bandpass.Q.value = 1; //troph of spectrum - 

        //Set low pass filter to reduce noise
        const lowpass = audioContext.current.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 300; // Set the cutoff frequency
        lowpass.Q.value = 1;

        const highpass = audioContext.current.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 60;


        //Connect filters to audiocontext
        // source.connect(bandpass);
        source.connect(lowpass);
        lowpass.connect(highpass);
        setMediaStream(source);

        const fftAnalyzer = audioContext.current.createAnalyser();
        fftAnalyzer.fftSize = 2048;
        const bufferLength = fftAnalyzer.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        highpass.connect(fftAnalyzer);

        const analyzer = meyda.createMeydaAnalyzer({
          audioContext: audioContext.current,
          source: fftAnalyzer,
          bufferSize: 512,
          featureExtractors: ['rms', 'spectralCentroid', 'perceptualSpread', 'powerSpectrum', 'amplitudeSpectrum'],
          callback: (features: Meyda.MeydaFeaturesObject) => {

            //First 5 values on spectralCentroid and perceptualSpread are NaN
            //If statement ensures the data shows on the graph immediately instead of
            //after 30 updates
            if (features.spectralCentroid) {
              spectralSmall.push(features.spectralCentroid);
            }
            rmsSmall.push(features.rms * 500);
            if (dataArray) {
              yinFrequencySmall.push(yin(dataArray, audioContext.current.sampleRate, 0.05));
            }
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
            if (yinFrequencySmall.length >= dataLengthRef.current) {
              yinFrequencySmall = yinFrequencySmall.slice(-dataLengthRef.current);
            }

            setSpectralArray(movingWindowFilter(spectralSmall));
            setRmsArray(movingWindowFilter(rmsSmall));
            setPerceptualSpreadArray(movingWindowFilter(perceptualSpreadSmall));
            // setPowerSpectrumArray(features.powerSpectrum);
            fftAnalyzer.getFloatTimeDomainData(dataArray);

            setYinFrequencyArray(movingWindowFilter(yinFrequencySmall))

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

  // const handleShowRms = () => {
  //   setAppOptions(prevOptions => ({
  //     ...prevOptions,
  //     showRms: !appOptions.showRms
  //   }))
  // };

  // const handleSetTicks = (ticks: number) => {
  //   setAppOptions(prevOptions => ({
  //     ...prevOptions,
  //     dataLength: ticks
  //   }))
  // }

  return (
    <div className='container'>
      <header>
        <h1>Velvet</h1>
        <h2>A Voice Resonance Analyzer</h2>
      </header>
      {/* <div style={{ padding: '10px' }}>
        <input type='checkbox' onChange={handleShowRms} checked={appOptions.showRms} />
        <label>Show Levels</label>
        <input type='range' min={200} max={10000} onChange={(e) => handleSetTicks(parseInt(e.target.value))} value={appOptions.dataLength} />
        <label> Chart Zoom : {appOptions.dataLength}</label>
      </div> */}

      <div className='plotContainer'>
        <SpectralPlot
          appOptions={appOptions}
          spectralArray={spectralArray}
          rmsArray={rmsArray}
          perceptualSpreadArray={perceptualSpreadArray}
          yinFrequencyArray={yinFrequencyArray}
        />
      </div>
      <div className='bottomNav'>
        <BottomNav
          isRecording={isRecording}
          startRecording={startRecording}
          appOptions={appOptions}
          setAppOptions={setAppOptions} />
      </div>


    </div >
  )
}