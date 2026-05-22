import { useRef, useState, useCallback } from "react";

export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      alert("Không thể truy cập Camera!");
    }
  };

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "locket_capture.jpg", {
        type: "image/jpeg",
      });
      onCapture(file, URL.createObjectURL(blob));
      stopCamera();
    }, "image/jpeg");
  }, [onCapture]);

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((track) => track.stop());
    onCancel();
  };

  return (
    <div
      style={{
        background: "#000",
        borderRadius: 14,
        overflow: "hidden",
        padding: 10,
      }}
    >
      {!stream ? (
        <button
          onClick={startCamera}
          style={{
            background: "#7F77DD",
            color: "#fff",
            padding: 10,
            width: "100%",
            borderRadius: 8,
          }}
        >
          Mở Camera
        </button>
      ) : (
        <div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", borderRadius: 8 }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              onClick={capturePhoto}
              style={{
                background: "#1D9E75",
                color: "#fff",
                padding: 10,
                flex: 1,
                borderRadius: 8,
              }}
            >
              Chụp
            </button>
            <button
              onClick={stopCamera}
              style={{
                background: "#E53E3E",
                color: "#fff",
                padding: 10,
                flex: 1,
                borderRadius: 8,
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
