import { useState, useRef } from "react";

export default function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const file = new File([audioBlob], "voice_note.webm", {
          type: "audio/webm",
        });
        onRecordingComplete(file, URL.createObjectURL(audioBlob));
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Không thể truy cập Micro!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
    }
  };

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
          onClick={stopRecording}
          style={{
            background: "#E53E3E",
            color: "white",
            padding: 10,
            borderRadius: 8,
            width: "100%",
          }}
        >
          ⏹ Dừng Ghi Âm
        </button>
      ) : (
        <button
          onClick={startRecording}
          style={{
            background: "#7F77DD",
            color: "white",
            padding: 10,
            borderRadius: 8,
            width: "100%",
          }}
        >
          🎙 Bắt Đầu Ghi Âm
        </button>
      )}
    </div>
  );
}
