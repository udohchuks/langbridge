"use client";

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface MicWidgetProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    isProcessing?: boolean;
}

export const MicWidget: React.FC<MicWidgetProps> = ({ onRecordingComplete, isProcessing = false }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Check supported MIME types in order of preference
            let mimeType = "";
            const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg", "audio/mp4", "audio/wav"];
            for (const type of mimeTypes) {
                if (MediaRecorder.isTypeSupported(type)) {
                    mimeType = type;
                    break;
                }
            }

            // Log for debugging
            console.log("MicWidget: Using MIME type:", mimeType || "default");

            const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            // Store the actual MIME type being used
            const actualMimeType = mediaRecorder.mimeType || mimeType || "audio/webm";

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                // Use the MIME type from the MediaRecorder
                const blob = new Blob(chunksRef.current, { type: actualMimeType });
                console.log("MicWidget: Recorded blob type:", blob.type, "size:", blob.size);
                onRecordingComplete(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please ensure you have granted microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`
          flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg
          ${isProcessing
                        ? 'bg-gray-200 cursor-not-allowed'
                        : isRecording
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }
        `}
            >
                {isProcessing ? (
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                ) : isRecording ? (
                    <Square className="w-6 h-6 text-white ill-white" />
                ) : (
                    <Mic className="w-8 h-8 text-white" />
                )}
            </button>
            <p className="mt-2 text-sm font-medium text-gray-500">
                {isRecording ? "Listening..." : isProcessing ? "Analyzing..." : "Tap to Speak"}
            </p>
        </div>
    );
};
