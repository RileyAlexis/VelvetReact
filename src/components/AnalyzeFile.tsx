import React, { useState, useRef, useEffect } from "react";
import meyda from "meyda";
import { MeydaAnalyzer } from "meyda/dist/esm/meyda-wa";

interface AnalyzeFileProps {
    setRms: Function,
    setSpectral: Function
}

export const AnalyzeFile: React.FC<AnalyzeFileProps> = ({ setRms, setSpectral }) => {

    const [mediaStreamSource, setMediaStreamSource] = useState<MediaStreamAudioSourceNode | null>(null);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [isEnded, setIsEnded] = useState<boolean>(false);
    const [meydaAnalyzer, setMeydaAnalyzer] = useState<MeydaAnalyzer | null>(null);
    const [error, setError] = useState<String>('');

    const audioFile = useRef<File>(null);

    // let audioFile: File;

    const audioContextRef = useRef<AudioContext | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('File Uploaded');
            audioFile.current = file;
            startRecording();
        }
    }

    const startRecording = async () => {
        if (!audioFile.current) {
            setError('Please select a file to analyze');
            return;
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }

        if (!isRecording) {
            try {
                setError('');
                setIsEnded(false);
                audioContextRef.current?.resume();
                let source: AudioBufferSourceNode | null = null;

                const arrayBuffer = await audioFile.current?.arrayBuffer();
                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

                source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);

                source.addEventListener('ended', () => {
                    audioContextRef.current!.suspend();
                    console.log('Ended event triggered');
                    setIsRecording(false);
                    setIsPaused(true);
                    setIsEnded(true);
                    analyzer?.stop();
                    // setMeydaAnalyzer(null);
                });

                source.start();
                setMediaStreamSource(source);

                const analyzer = meyda.createMeydaAnalyzer({
                    audioContext: audioContextRef.current,
                    source: source,
                    bufferSize: 512,
                    featureExtractors: ['rms', 'spectralCentroid'],
                    callback: (features: Meyda.MeydaFeaturesObject) => {
                        setRms(features.rms);
                        setSpectral(features.spectralCentroid);
                    }
                });
                analyzer.start();
                setMeydaAnalyzer(analyzer);
                setIsRecording(true);
                setIsPaused(false);
            } catch (error) {
                console.error('Error decoding audio file', error);
            }
        }
    };

    const handlePause = () => {

        audioContextRef.current?.suspend();
        // meydaAnalyzer?.stop(); //Stopping analyzer on suspend results in multiple analyzers running
        setIsRecording(false);
        setIsPaused(true);

        setIsRecording(false);
    }

    const handleResume = () => {
        if (audioFile.current) {
            audioContextRef.current?.resume();
            // meydaAnalyzer?.start(); //Stopping analyzer on suspend results in multiple analyzers running
            setIsRecording(true);
            setIsPaused(false);
        } else {
            setError('Please select a file to analyze');

        }
    }

    useEffect(() => {
        console.log('Meyda Analyzer', meydaAnalyzer);
    }, [meydaAnalyzer]);

    return (
        <div>
            <input type='file' accept="audio/*" onChange={handleFileUpload} />
            <button onMouseDown={startRecording} disabled={!isEnded}>Replay</button>
            <button onMouseDown={handleResume} disabled={!isPaused}>Resume</button>
            <button onMouseDown={handlePause} disabled={isPaused}>Pause</button>
            <span style={{ color: 'red' }}>{error}</span>
        </div>
    )
}