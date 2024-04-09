# Velvet
## A Voice Resonance Analyzer

### About

Velvet grew out of a need for a more accurate, free and open source voice analysis
application that could also be trustworthy. This application is intended to assist
trans feminine people in voice training by providing data driven feedback in real time. 
This application is free and always will be. It collects no data and does not communicate with any other services. 

### Technical
Velvet is a front end web application using [React](https://react.dev), [Material UI](https://mui.com) and [MeydaJS](https://meyda.js.org) libraries. The application uses the [web audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) for microphone access, audio filters and initial signal processing. 

#### Frequencies
Velvet isolates the [Fundamental Frequency](https://en.wikipedia.org/wiki/Fundamental_frequency) and the [First Formant Frequency](https://en.wikipedia.org/wiki/Formant) from an audio stream. This information should give an accurate estimate of the range
of frequencies in a human voice. 

#### Filters
Currently a lowpass filter is applied at 300hz and a highpass filter at 30hz. This assists
in filtering out background noise and sounds not in the standard vocal range. These settings may be updatable in a future version. 

#### File Analysis
Audio files can be uploaded for analysis with a maximum size of 10mb. Files are not saved or retained in any way and must be uploaded each time. 

### FAQ

Velvet is not currently capable of recording(saving) the audio signal. In the future the option for saving audio locally may be implemented. This application will not be hosting any data via a database. 

Testing is ongoing with the signal processing algorithms and filters and will continue to be adjusted for usefulness and accurate feedback. 

### Deployed Application

The current deployed version of Velvet can be found at https://velvet.rileyalexis.com.