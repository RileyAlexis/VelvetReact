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
    callStopAnalyzer();
    stopMicStream();
  }

  const startFileAnalyzing = async (file: File) => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext({
        latencyHint: "interactive"
      });
    } else {
      audioContext.current.resume();
    }

    await accessFileStream(audioContext.current, file)
      .then((sourceNode) => {
        startAnalyzer(audioContext.current, sourceNode, setAudioData, appOptionsRef.current);
        setIsFilePlaying(true);
      }).catch((error) => {
        console.error("Error accessing audio file", error);
      })
  }

  const handleMicPause = () => {
    stopRecording();
  }

  const handleFilePause = () => {
    audioContext.current.suspend();
    setIsFilePlaying(false);
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
          handleMicPause={handleMicPause}
          handleFilePause={handleFilePause}
          handleResume={handleResume}
          isEnded={isEnded}
          setIsEnded={setIsEnded}
          isFilePlaying={isFilePlaying}
        />
      </div>
    </div>
  )
}