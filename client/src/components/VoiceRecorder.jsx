import { useState, useRef, useCallback, useEffect } from "react";

export default function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const streamRef = useRef(null);
  const mimeTypeRef = useRef("");

  const getSupportedMimeType = () => {
    if (
      window.MediaRecorder &&
      MediaRecorder.isTypeSupported("audio/mp4")
    ) {
      return "audio/mp4";
    }

    if (
      window.MediaRecorder &&
      MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ) {
      return "audio/webm;codecs=opus";
    }

    if (
      window.MediaRecorder &&
      MediaRecorder.isTypeSupported("audio/webm")
    ) {
      return "audio/webm";
    }

    return "";
  };

  const getFileExtension = (mimeType) => {
    if (mimeType.includes("mp4")) return "mp4";
    if (mimeType.includes("webm")) return "webm";
    return "audio";
  };

  const stopMicrophone = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Trình duyệt không hỗ trợ Micro!");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      audioChunks.current = [];

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorder.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMimeType =
          mimeTypeRef.current || audioChunks.current[0]?.type || "audio/mp4";

        const audioBlob = new Blob(audioChunks.current, {
          type: finalMimeType,
        });

        const ext = getFileExtension(finalMimeType);

        const file = new File(
          [audioBlob],
          `voice_note_${Date.now()}.${ext}`,
          {
            type: finalMimeType,
            lastModified: Date.now(),
          }
        );

        const previewUrl = URL.createObjectURL(audioBlob);

        if (onRecordingComplete) {
          onRecordingComplete(file, previewUrl);
        }

        audioChunks.current = [];
        stopMicrophone();
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.log("Micro error:", err);
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