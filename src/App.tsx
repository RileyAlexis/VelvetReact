import React, { useState, useRef, useEffect } from 'react'

//Material UI
// import { useMediaQuery } from "@mui/material";

import './App.css'

//Types
import { AudioData } from './interfaces';
import { AppOptions } from './interfaces';

//Components
import { SpectralPlot } from './components/SpectralPlot';
import { BottomNav } from './components/BottomNav';

//Modules
import { accessMic, stopMicStream, accessFileStream } from './modules/audioSources.js';
import { startAnalyzer, callStopAnalyzer } from './modules/startAnalyzer.js';

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
    iOSInstall: true
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
    console.log(audioContext.current);
    if (!audioContext.current || audioContext.current.state === 'closed') {
      console.log('Creating new context for mic');
      audioContext.current = new AudioContext({
        latencyHint: "interactive"
      });
    } else if (audioContext.current.state === 'suspended') {
      await audioContext.current.resume();
    } else {
      audioContext.current = new AudioContext({
        latencyHint: "interactive"
      });
    }

    setIsRecording(true);
    setIsMicOn(true);
    await accessMic(audioContext.current)
      .then((sourceNode) => {
        startAnalyzer(audioContext.current, sourceNode, setAudioData, appOptionsRef.current);
      }).catch((error) => {
        console.error("Error accessing microphone", error);
      });
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
    if (isRecording) {
      stopRecording();
    }
    if (!audioContext.current || audioContext.current.state === 'closed') {
      audioContext.current = new AudioContext({
        latencyHint: "interactive"
      });
    } else {
      audioContext.current.resume();
    }

    await accessFileStream(audioContext.current, file)
      .then((sourceNode) => {

        sourceNode.addEventListener('ended', async () => {
          const handleFileEnd = () => {
            sourceNode.removeEventListener('ended', handleFileEnd);
          }
          console.log('App end event triggered');
          setIsFilePlaying(false);
          setIsEnded(true);
        })

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

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
      })
    }
  })

  return (
    <div className='container'>

      <center>
        <header>
          <h4>Velvet</h4>
          <h5>A Voice Resonance Analyzer</h5>
        </header>
      </center>
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