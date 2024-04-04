export const accessMic =
    (audioContext: AudioContext): Promise<MediaStreamAudioSourceNode> => {

        return new Promise<MediaStreamAudioSourceNode>((resolve, reject) => {

            navigator.mediaDevices.getUserMedia({ audio: true })

                .then((stream) => {
                    const source = audioContext.createMediaStreamSource(stream);
                    resolve(source);
                }).catch((error) => {
                    reject(error);
                })
        })
    }

export const accessFileStream =
    (audioContext: AudioContext, audioFile: File): Promise<AudioBufferSourceNode> => {

        return new Promise<AudioBufferSourceNode>((resolve, reject) => {

            audioFile.arrayBuffer()
                .then((arrayBuffer) =>
                    audioContext.decodeAudioData(arrayBuffer)
                ).then((audioBuffer) => {
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    resolve(source);
                }).catch((error) => {
                    reject(error);
                })
        })
    }
