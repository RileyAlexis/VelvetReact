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
