import React, { useState, useRef, useEffect, useCallback } from 'react'
import meyda from 'meyda';

import { Button } from '@mui/material';

import './App.css'
import { MeydaAnalyzer } from 'meyda/dist/esm/meyda-wa';

//Components
import { AnalyzeFile } from './components/AnalyzeFile';
import { SpectralPlot } from './components/SpectralPlot';

//Interfaces
import { AppOptions } from './interfaces';


export const App: React.FC = () => {

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const audioContext = useRef<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStreamAudioSourceNode | null>(null);
  const [meydaAnalyzer, setMeydaAnalyzer] = useState<MeydaAnalyzer | null>(null);

  const [rms, setRms] = useState<number | null>(null);
  const [rmsArray, setRmsArray] = useState<number[]>([]);
  const [spectral, setSpectral] = useState<number>(0);
  const [spectralArray, setSpectralArray] = useState<number[]>([]);
  const [amplitudeSpectrum, _] = useState<Float32Array[] | null>(null);
  const [perceptualSpread, setPerceptualSpread] = useState<number>(0);
  const [perceptualSpreadArray, setPerceptualSpreadArray] = useState<number[]>([]);

  const [appOptions, setAppOptions] = useState<AppOptions>({
    averageTicks: 30,
    plotHorizAxis: 100,
    showSpectral: true,
    colorSpectral: '#fa9ef2',
    showRms: true,
    colorRms: '#f2fa9e'
  })

  const averageTicksRef = useRef(appOptions.averageTicks);

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

    return dataSum.slice(averageTicksRef.current).map((value, index) =>
      (value - dataSum[index]) / averageTicksRef.current);
  }, [appOptions]);

  const calculateAnalyser = useCallback((features: Meyda.MeydaFeaturesObject) => {
    //Averages spectral centroid over 30 ticks then limits display to previous 100
    spectralSmall.push(features.spectralCentroid);
    rmsSmall.push((features.rms) * 1000);
    perceptualSpreadSmall.push(features.perceptualSpread * 100);


    let spectralAverage: number = 0;
    let rmsAverage: number = 0;
    let perceptualSpreadAverage = 0;

    if (spectralSmall.length > averageTicksRef.current) {
      for (let i = 0; i < spectralSmall.length; i++) {
        spectralAverage += spectralSmall[i];
      }

      if (rmsSmall.length > averageTicksRef.current) {
        for (let i = 0; i < rmsSmall.length; i++) {
          rmsAverage += rmsSmall[i];
        }
      }

      if (perceptualSpreadSmall.length > averageTicksRef.current) {
        for (let i = 0; i < perceptualSpreadSmall.length; i++) {
          perceptualSpreadAverage += perceptualSpreadSmall[i];
        }
      }


      spectralSmall = [];
      rmsSmall = [];
      perceptualSpreadSmall = [];

      setPerceptualSpreadArray((prevValues) => {
        const newValues = [...prevValues, (perceptualSpreadAverage / averageTicksRef.current)];
        return newValues.slice(Math.max(newValues.length - 100, 0));
      })

      setSpectralArray((prevValues) => {
        const newValues = [...prevValues, (spectralAverage / averageTicksRef.current)];
        return newValues.slice(Math.max(newValues.length - 100, 0));
      });

      setRmsArray((prevValues) => {
        const newValues = [...prevValues, (rmsAverage / averageTicksRef.current)];
        return newValues.slice(Math.max(newValues.length - 100, 0));
      });
    }
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
          featureExtractors: ['rms', 'spectralCentroid', 'amplitudeSpectrum', 'perceptualSpread'],
          callback: (features: Meyda.MeydaFeaturesObject) => {
            spectralSmall.push(features.spectralCentroid);
            rmsSmall.push(features.rms * 500);
            if (spectralSmall.length > 1000) {
              spectralSmall = spectralSmall.slice(-1000);
            }
            if (rmsSmall.length > 1000) {
              rmsSmall = rmsSmall.slice(-1000);
            }


            setSpectralArray(movingWindowFilter(spectralSmall));
            setRmsArray(movingWindowFilter(rmsSmall));

            setRms(features.rms);
            setSpectral(features.spectralCentroid);
            setPerceptualSpread(features.perceptualSpread * 100);
            // setAmplitudeSpectrum(features.amplitudeSpectrum.map(value => value * 100));
            // calculateAnalyser(features);

            // console.log(amplitudeSpectrum);
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
  }, [appOptions.averageTicks]);

  useEffect(() => {
    // console.log('Spectral Array length', spectralArray[spectralArray.length - 1]);
    // console.log(rmsArray);
  }, [rmsArray]);

  const handleShowRms = () => {
    setAppOptions(prevOptions => ({
      ...prevOptions,
      showRms: !appOptions.showRms
    }))
  };

  const handleSetTicks = (ticks: number) => {
    setAppOptions(prevOptions => ({
      ...prevOptions,
      averageTicks: ticks
    }))
  }

  return (
    <div>
      <Button onMouseDown={startRecording}>Mic {JSON.stringify(isRecording)}</Button>
      <br />
      <span>RMS: {rms}</span>
      <br />
      <span>Spectral Centroid: {spectral}</span>
      <br />
      <span>Perceptual Spread: {perceptualSpread}</span>
      <AnalyzeFile
        // appOptions={appOptions}
        setRms={setRms}
        setSpectral={setSpectral}
        calculateAnalyzer={calculateAnalyser} />

      <div style={{ padding: '10px' }}>
        <input type='checkbox' onChange={handleShowRms} checked={appOptions.showRms} />
        <label>Show Levels</label>
        <input type='range' min={1} max={100} onChange={(e) => handleSetTicks(parseInt(e.target.value))} value={appOptions.averageTicks} />
        <label>Average Ticks - {appOptions.averageTicks}</label>
      </div>


      <div>
        <SpectralPlot
          appOptions={appOptions}
          spectralArray={spectralArray}
          rmsArray={rmsArray}
          amplitudeSpectrum={amplitudeSpectrum}
          perceptualSpreadArray={perceptualSpreadArray}
        />
      </div>


    </div>
  )
}