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
  const audioContext = useRef<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStreamAudioSourceNode | AudioBufferSourceNode | null>(null);
  const [meydaAnalyzer, setMeydaAnalyzer] = useState<MeydaAnalyzer | null>(null);


  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isFilePlaying, setIsFilePlaying] = useState<boolean>(false);



  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isEnded, setIsEnded] = useState<boolean>(false);

  const [rmsArray, setRmsArray] = useState<number[]>([]);
  const [spectralArray, setSpectralArray] = useState<number[]>([]);
  const [perceptualSpreadArray, setPerceptualSpreadArray] = useState<number[]>([]);
  const [formantFrequencyArray, setFormantFrequencyArray] = useState<number[]>([]);
  const [yinFrequencyArray, setYinFrequencyArray] = useState<number[]>([]);

  // const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const [appOptions, setAppOptions] = useState<AppOptions>({
    averageTicks: 30,
    plotHorizAxis: 100,
    showSpectral: false,
    colorSpectral: '#fa9ef2',
    showRms: false,
    colorRms: '#f2fa9e',
    showPerceptual: false,
    colorPerceptual: '#fff',
    showYin: true,
    colorYin: '#7ee86d',
    showFirstFormant: true,
    colorFirstFormant: '#520477',
    dataLength: 500,
  });

  const averageTicksRef = useRef<number>(appOptions.averageTicks);
  const dataLengthRef = useRef<number>(appOptions.dataLength);
  const micOnRef = useRef<boolean>(false);
  const fileOnRef = useRef<boolean>(false);
  const audioFileRef = useRef<File>(null);


  let rmsSmall: number[] = [];
  let spectralSmall: number[] = [];
  let perceptualSpreadSmall: number[] = [];
  let yinFrequencySmall: number[] = [];
  let formantFrequencySmall: number[] = [];

  // const amplitudeSpectrumRef = useRef(amplitudeSpectrum);

  const startRecording = () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
      setIsRecording(true);
      micOnRef.current = true;
      setIsMicOn(true);
      startAnalyzer(null);
    }
    if (audioContext.current) {
      setIsRecording(true);
      micOnRef.current = true;
      setIsMicOn(true);
      startAnalyzer(null);
    }
  }

  const startFileAnalyzing = (file: File) => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
      setIsRecording(true);
      setIsFilePlaying(true);
      // fileOnRef.current = true;
      audioFileRef.current = file;
      startAnalyzer(file);

      if (audioContext.current) {
        setIsRecording(true);
        setIsFilePlaying(true);
        // fileOnRef.current = true;
        audioFileRef.current = file;
        startAnalyzer(file);
      }
    }

    //Allows replay of the same file
    if (audioContext.current.state === 'suspended') {
      setIsRecording(true);
      // fileOnRef.current = true;
      startAnalyzer(audioFileRef.current);
    }

  }

  //Sets the Meyda output of 0 to half the FFT Size against the hertz scale
  const normalizeSpectralCentroid =
    (spectralCentroid: number, sampleRate: number, fftSize: number) => {
      const frequency = spectralCentroid * (sampleRate / fftSize);
      return frequency;
    };

  const calculateFirstFormantFrequency = (dataArray: Float32Array) => {
    let peakIndex = 0;
    let peakValue = -Infinity;
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > peakValue) {
        peakValue = dataArray[i];
        peakIndex = i;
      }

      // console.log("First formant frequency:", firstFormantFrequency.toFixed(2), "Hz");
    }
    const firstFormantFrequency = (peakIndex * audioContext.current.sampleRate) / dataArray.length;
    return firstFormantFrequency;
  }

  const movingWindowFilter = useCallback((data: number[]) => {
    const dataSum = [0];
    for (let i = 0; i < data.length; i++) {
      dataSum[i + 1] = dataSum[i] + data[i];
    }

    return dataSum.slice(30).map((value, index) =>
      (value - dataSum[index]) / averageTicksRef.current);
  }, [appOptions]);


  const startAnalyzer = async (audioFile: File) => {

    audioContext.current?.resume();
    let source: MediaStreamAudioSourceNode | AudioBufferSourceNode | null = null;

    if (!isRecording) {
      try {
        if (micOnRef.current) {
          let stream: MediaStream | null = null;

          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          source = audioContext.current?.createMediaStreamSource(stream);
        }
        if (audioFile) {
          console.log(audioFile);
          const arrayBuffer = await audioFile.arrayBuffer();
          const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);

          source = audioContext.current.createBufferSource();
          source.buffer = audioBuffer;

          // Placing the connect here skips the high and low pass filters for playing 
          // the audio through the speakers. Filters are still applied to the data display.
          // Audio sounds muffled when run through the filters.
          source.connect(audioContext.current.destination);
          source?.start();

          source.addEventListener('ended', async () => {
            await audioContext.current!.suspend();
            // await audioContext.current.close();
            console.log('Ended event triggered');
            setIsRecording(false);
            setIsEnded(true);
            setIsFilePlaying(false);
            analyzer?.stop();
            audioContext.current = null;
          });
        }

        //Set low pass filter to reduce noise
        const lowpass = audioContext.current.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 300; // Set the cutoff frequency
        lowpass.Q.value = 1;

        const highpass = audioContext.current.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 60;

        //Connect filters to audiocontext
        source.connect(lowpass);
        lowpass.connect(highpass);
        setMediaStream(source);

        const fftAnalyzer = audioContext.current.createAnalyser();
        fftAnalyzer.fftSize = 2048;
        const bufferLength = fftAnalyzer.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        highpass.connect(fftAnalyzer);

        // const formantAnalyzer = audioContext.current.createAnalyser();
        // formantAnalyzer.fftSize = 2048;
        // const formantBufferLength = formantAnalyzer.frequencyBinCount;
        // const formantArray = new Float32Array(formantBufferLength);
        // highpass.connect(formantAnalyzer);

        const analyzer = meyda.createMeydaAnalyzer({
          audioContext: audioContext.current,
          source: fftAnalyzer,
          bufferSize: 2048,
          featureExtractors: ['rms', 'spectralCentroid', 'perceptualSpread', 'amplitudeSpectrum'],
          callback: (features: Meyda.MeydaFeaturesObject) => {

            //First 5 values on spectralCentroid and perceptualSpread are NaN
            //If statement ensures the data shows on the graph immediately instead of
            //after 30 updates as determined by the windowing function
            if (features.spectralCentroid) {
              spectralSmall.push(
                normalizeSpectralCentroid(
                  features.spectralCentroid,
                  audioContext.current.sampleRate,
                  fftAnalyzer.fftSize));
            }
            //Todo - Map RMS value to the displayed scale
            rmsSmall.push(features.rms * 500);
            const yinValue = yin(dataArray, audioContext.current.sampleRate, 0.05);

            if (yinValue) {
              yinFrequencySmall.push(yinValue);
            }
            formantFrequencySmall.push(calculateFirstFormantFrequency(features.amplitudeSpectrum));

            //Todo - Map perceptual Spread to the hertz scale
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
            if (formantFrequencySmall.length >= dataLengthRef.current) {
              formantFrequencySmall = formantFrequencySmall.slice(-dataLengthRef.current);
            }

            if (yinFrequencySmall.length >= dataLengthRef.current) {
              yinFrequencySmall = yinFrequencySmall.slice(-dataLengthRef.current);
            }

            setSpectralArray(movingWindowFilter(spectralSmall));
            setRmsArray(movingWindowFilter(rmsSmall));
            setPerceptualSpreadArray(movingWindowFilter(perceptualSpreadSmall));
            // setPowerSpectrumArray(features.powerSpectrum);
            fftAnalyzer.getFloatTimeDomainData(dataArray);
            // formantAnalyzer.getFloatFrequencyData(formantArray);

            setFormantFrequencyArray(movingWindowFilter(formantFrequencySmall));
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
      if (audioContext.current) {
        mediaStream.disconnect();
        audioContext.current?.suspend();
      }

      if (meydaAnalyzer) {
        meydaAnalyzer.stop();
        console.log('Meyda stop called');
      }
      setIsRecording(false);
      micOnRef.current = false;
      setIsMicOn(false);
    }
  };

  const handlePause = () => {

    audioContext.current?.suspend();
    // meydaAnalyzer?.stop(); //Stopping analyzer on suspend results in multiple analyzers running
    setIsFilePlaying(false);

  }

  const handleResume = () => {
    if (audioFileRef.current) {
      audioContext.current?.resume();
      // meydaAnalyzer?.start(); //Stopping analyzer on suspend results in multiple analyzers running
      setIsFilePlaying(true);
    } else {
      console.error('Please select a file to analyze');
    }
  }

  useEffect(() => {
    averageTicksRef.current = appOptions.averageTicks;
    dataLengthRef.current = appOptions.dataLength;

  }, [appOptions.averageTicks, appOptions.dataLength]);

  return (
    <div className='container'>
      <header>
        <h1>Velvet</h1>
        <h2>A Voice Resonance Analyzer</h2>
      </header>
      <div className='plotContainer'>
        <SpectralPlot
          appOptions={appOptions}
          spectralArray={spectralArray}
          rmsArray={rmsArray}
          perceptualSpreadArray={perceptualSpreadArray}
          yinFrequencyArray={yinFrequencyArray}
          formantFrequencyArray={formantFrequencyArray}
        />
      </div>
      <div className='bottomNav'>
        <BottomNav
          isRecording={isRecording}
          startRecording={startRecording}
          startFileAnalyzing={startFileAnalyzing}
          appOptions={appOptions}
          setAppOptions={setAppOptions}
          // fileOnRef={fileOnRef.current}
          isMicOn={isMicOn}
          handlePause={handlePause}
          handleResume={handleResume}
          isEnded={isEnded}
          setIsEnded={setIsEnded}
          isFilePlaying={isFilePlaying}
        />
      </div>


    </div >
  )
}