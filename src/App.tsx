import React, { useState, useRef, useEffect } from 'react'

//Material UI
// import { useMediaQuery } from "@mui/material";

import './App.css'

//Types
import { AudioData } from './interfaces';

//Components
import { SpectralPlot } from './components/SpectralPlot';
import { BottomNav } from './components/BottomNav';

//Modules
import { accessMic, stopMicStream, accessFileStream } from './modules/audioSources.js';
import { startAnalyzer, callStopAnalyzer } from './modules/startAnalyzer.js';

//Interfaces
import { AppOptions } from './interfaces';


export const App: React.FC = () => {
  const audioContext = useRef<AudioContext | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isFilePlaying, setIsFilePlaying] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);

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
    dataLength: 250,
  });

  const appOptionsRef = useRef<AppOptions>(appOptions);
  const micOnRef = useRef<boolean>(false);

  const [audioData, setAudioData] = useState<AudioData>({
    yinFrequency: [],
    averageYin: 0,
    formantFrequency: [],
    averageFormant: 0
  });

  const startRecording = async () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext({
        latencyHint: "interactive"
      });

      setIsRecording(true);
      setIsMicOn(true);
      await accessMic(audioContext.current)
        .then((sourceNode) => {
          console.log(sourceNode);
          startAnalyzer(audioContext.current, sourceNode, setAudioData, appOptionsRef.current);
        }).catch((error) => {
          console.error("Error accessing microphone", error);
        });
    } else {
      audioContext.current.resume();
      setIsRecording(true);
      setIsMicOn(true);
      await accessMic(audioContext.current)
        .then((sourceNode) => {
          console.log(sourceNode);
          startAnalyzer(audioContext.current, sourceNode, setAudioData, appOptionsRef.current);
        }).catch((error) => {
          console.error("Error accessing microphone", error);
        });
    }
  }

  const stopRecording = async () => {
    if (!audioContext.current) return;
    if (audioContext.current.state !== 'running') return;

    setIsMicOn(false);
    await audioContext.current.suspend();
    stopMicStream();
    callStopAnalyzer();
  }

  const startFileAnalyzing = async (file: File) => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext({
        latencyHint: "interactive"
      });

      await accessFileStream(audioContext.current, file)
        .then((sourceNode) => {
          startAnalyzer(audioContext.current, sourceNode, setAudioData, appOptionsRef.current);
        }).catch((error) => {
          console.error("Error accessing audio file", error);
        })

    }
  }

  // const startAnalyzer = async (audioFile: File) => {

  //   audioContext.current.resume();
  //   let source: MediaStreamAudioSourceNode | AudioBufferSourceNode | null = null;

  //   if (!isRecording) {

  //     if (micOnRef.current) {
  //       await accessMic(audioContext.current)
  //         .then((sourceNode) => {
  //           source = sourceNode;
  //         }).catch((error) => {
  //           console.error("Error accessing microphone", error);
  //         })
  //     }

  //     if (audioFile) {
  //       await accessFileStream(audioContext.current, audioFile)
  //         .then((sourceNode) => {
  //           source = sourceNode;
  //           source.connect(audioContext.current.destination);
  //           source.start();

  //           source.addEventListener('ended', async () => {
  //             const handleFileEnd = () => {
  //               source.removeEventListener('ended', handleFileEnd);
  //             }

  //             console.log('Ended event triggered');
  //             await audioContext.current.suspend();
  //             setIsRecording(false);
  //             setIsEnded(true);
  //             setIsFilePlaying(false);
  //             await analyzer?.stop();
  //           });
  //         })
  //         .catch((error) => {
  //           console.error("Error creating audio file buffer", error);
  //         });
  //     }

  //     console.log('Audio File', audioFile);
  // const arrayBuffer = await audioFile.arrayBuffer();
  // const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);

  // source = audioContext.current.createBufferSource();
  // source.buffer = audioBuffer;

  // Placing the connect here skips the high and low pass filters for playing
  // the audio through the speakers. Filters are still applied to the data display.
  // Audio sounds muffled when run through the filters.
  // if (audioFile) {
  //   source.connect(audioContext.current.destination);
  //   source?.start();
  // }

  // useEffect(() => {
  //   const handleFileEnd = () => {
  //     console.log('File end event triggered');
  //     source.removeEventListener('ended', handleFileEnd);
  //   }

  //   source.addEventListener('ended', async () => {
  //     console.log('Ended event triggered');
  //     await audioContext.current!.suspend();
  //     setIsRecording(false);
  //     setIsEnded(true);
  //     setIsFilePlaying(false);
  //     analyzer?.stop();
  //     audioContext.current = null;
  //   });

  //   return () => {
  //     source.removeEventListener('ended', handleFileEnd);
  //   }
  // })


  //     //Set low pass filter to reduce noise
  //     const lowpass = audioContext.current.createBiquadFilter();
  //     lowpass.type = 'lowpass';
  //     lowpass.frequency.value = 300; // Set the cutoff frequency
  //     lowpass.Q.value = 1;

  //     const highpass = audioContext.current.createBiquadFilter();
  //     highpass.type = 'highpass';
  //     highpass.frequency.value = 60;

  //     //Connect filters to audiocontext
  //     source.connect(lowpass);
  //     lowpass.connect(highpass);
  //     setMediaStream(source);

  //     const fftAnalyzer = audioContext.current.createAnalyser();
  //     fftAnalyzer.fftSize = 2048;
  //     const bufferLength = fftAnalyzer.frequencyBinCount;
  //     const dataArray = new Float32Array(bufferLength);
  //     highpass.connect(fftAnalyzer);

  //     // const formantAnalyzer = audioContext.current.createAnalyser();
  //     // formantAnalyzer.fftSize = 2048;
  //     // const formantBufferLength = formantAnalyzer.frequencyBinCount;
  //     // const formantArray = new Float32Array(formantBufferLength);
  //     // highpass.connect(formantAnalyzer);

  //     const analyzer = meyda.createMeydaAnalyzer({
  //       audioContext: audioContext.current,
  //       source: fftAnalyzer,
  //       bufferSize: 2048,
  //       featureExtractors: ['rms', 'spectralCentroid', 'perceptualSpread', 'amplitudeSpectrum'],
  //       callback: (features: Meyda.MeydaFeaturesObject) => {

  //         //First 5 values on spectralCentroid and perceptualSpread are NaN
  //         //If statement ensures the data shows on the graph immediately instead of
  //         //after 30 updates as determined by the windowing function
  //         if (features.spectralCentroid) {
  //           spectralSmall.push(
  //             normalizeSpectralCentroid(
  //               features.spectralCentroid,
  //               audioContext.current.sampleRate,
  //               fftAnalyzer.fftSize));
  //         }
  //         //Todo - Map RMS value to the displayed scale
  //         rmsSmall.push(features.rms * 500);
  //         const yinValue = yin(dataArray, audioContext.current.sampleRate, 0.05);

  //         if (yinValue) {
  //           yinFrequencySmall.push(yinValue);
  //         }
  //         formantFrequencySmall.push(calculateFirstFormantFrequency(features.amplitudeSpectrum, audioContext.current.sampleRate));

  //         //Todo - Map perceptual Spread to the hertz scale
  //         if (features.perceptualSpread) perceptualSpreadSmall.push(features.perceptualSpread * 50);

  //         if (spectralSmall.length >= dataLengthRef.current) {
  //           spectralSmall = spectralSmall.slice(-dataLengthRef.current);
  //         }
  //         if (rmsSmall.length >= dataLengthRef.current) {
  //           rmsSmall = rmsSmall.slice(-dataLengthRef.current);
  //         }
  //         if (perceptualSpreadSmall.length >= dataLengthRef.current) {
  //           perceptualSpreadSmall = perceptualSpreadSmall.slice(-dataLengthRef.current);
  //         }
  //         if (formantFrequencySmall.length >= dataLengthRef.current) {
  //           formantFrequencySmall = formantFrequencySmall.slice(-dataLengthRef.current);
  //         }

  //         if (yinFrequencySmall.length >= dataLengthRef.current) {
  //           yinFrequencySmall = yinFrequencySmall.slice(-dataLengthRef.current);
  //         }

  //         setSpectralArray(movingWindowFilter(spectralSmall, averageTicksRef.current));
  //         setRmsArray(movingWindowFilter(rmsSmall, averageTicksRef.current));
  //         setPerceptualSpreadArray(movingWindowFilter(perceptualSpreadSmall, averageTicksRef.current));
  //         // setPowerSpectrumArray(features.powerSpectrum);
  //         fftAnalyzer.getFloatTimeDomainData(dataArray);
  //         // formantAnalyzer.getFloatFrequencyData(formantArray);

  //         setFormantFrequencyArray(movingWindowFilter(formantFrequencySmall, averageTicksRef.current));
  //         setYinFrequencyArray(movingWindowFilter(yinFrequencySmall, averageTicksRef.current))
  //         setYinFrequencyArray(movingWindowFilter(yinFrequencySmall, averageTicksRef.current))
  //       }
  //     });

  //     analyzer.start();
  //     setMeydaAnalyzer(analyzer);

  //     setIsRecording(true);

  //   } else {
  //     console.log('Stop recording called');
  //     if (audioContext.current) {
  //       mediaStream.disconnect();
  //       audioContext.current?.suspend();
  //     }

  //     if (meydaAnalyzer) {
  //       meydaAnalyzer.stop();
  //       console.log('Meyda stop called');
  //     }
  //     setIsRecording(false);
  //     micOnRef.current = false;
  //     setIsMicOn(false);
  //   }
  // };

  const handlePause = () => {

    stopRecording();
  }

  const handleResume = () => {
    audioContext.current.resume();
    // meydaAnalyzer?.start(); //Stopping analyzer on suspend results in multiple analyzers running
    setIsFilePlaying(true);
  }

  //Cannot use the entire object - each value must be specified or it will not update
  //because react is ornery
  useEffect(() => {
    appOptionsRef.current.averageTicks = appOptions.averageTicks;
    appOptionsRef.current.dataLength = appOptions.dataLength;
    micOnRef.current = isMicOn;
  }, [appOptions, isMicOn]);

  return (
    <div className='container'>
      <header>
        <h1>Velvet</h1>
        <h2>A Voice Resonance Analyzer</h2>
      </header>
      <div className='plotContainer'>
        <SpectralPlot
          appOptions={appOptions}
          audioData={audioData}
        />
      </div>
      <div className='bottomNav'>
        <BottomNav
          isRecording={isRecording}
          startRecording={startRecording}
          startFileAnalyzing={startFileAnalyzing}
          appOptions={appOptions}
          setAppOptions={setAppOptions}
          isMicOn={isMicOn}
          handlePause={handlePause}
          handleResume={handleResume}
          isEnded={isEnded}
          setIsEnded={setIsEnded}
          isFilePlaying={isFilePlaying}
        />
      </div>
    </div>
  )
}