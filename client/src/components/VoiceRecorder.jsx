import { useState, useRef, useCallback, useEffect } from "react";

export default function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const streamRef = useRef(null);

  const stopMicrophone = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      audioChunks.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, {
          type: "audio/webm",
        });

        const file = new File([audioBlob], "voice_note.webm", {
          type: "audio/webm",
        });

        if (onRecordingComplete) {
          onRecordingComplete(file, URL.createObjectURL(audioBlob));
        }

        audioChunks.current = [];
        stopMicrophone();
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Không thể truy cập Micro!");
      setIsRecording(false);
      stopMicrophone();
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorder.current &&
      mediaRecorder.current.state !== "inactive"
    ) {
      mediaRecorder.current.stop();
    } else {
      stopMicrophone();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      if (
        mediaRecorder.current &&
        mediaRecorder.current.state !== "inactive"
      ) {
        mediaRecorder.current.stop();
      }

      stopMicrophone();
    };
  }, [stopMicrophone]);

  return (
    <div
      style={{
        padding: 10,
        background: isRecording ? "#EEEDFE" : "#F8F7FE",
        borderRadius: 10,
      }}
    >
      {isRecording ? (
        <button
          type="button"
          onClick={stopRecording}
          style={{
            background: "#E53E3E",
            color: "white",
            padding: 10,
            borderRadius: 8,
            width: "100%",
          }}
        >
          ⏹ Tap to Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          style={{
            background: "#7F77DD",
            color: "white",
            padding: 10,
            borderRadius: 8,
            width: "100%",
          }}
        >
          🎙 Tap to Record
        </button>
      )}
    </div>
  );
}