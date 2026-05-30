import { useRef, useState, useCallback, useEffect } from "react";

export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  const stopTracks = (mediaStream) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
  };

  const startCamera = async (mode = facingMode) => {
    try {
      stopTracks(stream);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
        },
        audio: false,
      });

      setStream(mediaStream);
    } catch (err) {
      console.log("Camera error:", err);
      alert("Không thể truy cập Camera!");
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play?.();
    }
  }, [stream]);

  const switchCamera = async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    await startCamera(nextMode);
  };

  const stopCamera = useCallback(() => {
    stopTracks(stream);
    setStream(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (onCancel) {
      onCancel();
    }
  }, [stream, onCancel]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `locket_capture_${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        const previewUrl = URL.createObjectURL(blob);

        onCapture(file, previewUrl);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  }, [onCapture, stopCamera, facingMode]);

  useEffect(() => {
    return () => {
      stopTracks(stream);
    };
  }, [stream]);

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
          type="button"
          onClick={() => startCamera(facingMode)}
          style={{
            background: "#7F77DD",
            color: "#fff",
            padding: 10,
            width: "100%",
            borderRadius: 8,
          }}
        >Launch Camera
        </button>
      ) : (
        <div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              borderRadius: 8,
              background: "#111",
              transform:
                facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
            }}
          />

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={capturePhoto}
              style={{
                background: "#1D9E75",
                color: "#fff",
                padding: 10,
                flex: 1,
                borderRadius: 8,
              }}
            >
              Shoot
            </button>

            <button
              type="button"
              onClick={switchCamera}
              style={{
                background: "#4F46E5",
                color: "#fff",
                padding: 10,
                flex: 1,
                borderRadius: 8,
              }}
            >
              Switch
            </button>

            <button
              type="button"
              onClick={stopCamera}
              style={{
                background: "#E53E3E",
                color: "#fff",
                padding: 10,
                flex: 1,
                borderRadius: 8,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
        