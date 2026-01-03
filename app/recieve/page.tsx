'use client';

import BgGradient from "../ui/bg-gradient";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";
import { useState } from "react";

import React from 'react'

const page = () => {
  const [fileid, setFileid] = useState<string>("");
  const [key, setKey] = useState<string>("");
  const [reqType, setReqtype] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const resetForm = () => {
    setFileid("");
    setKey("");
    setReqtype("");
    setFeedback(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;
    setFeedback(null);

    if (!fileid.trim() || !key.trim()) {
      setFeedback({ type: 'error', message: 'Please enter both File ID and Key' });
      return;
    }

    setIsLoading(true);
    
    try {
      const dataToSend = new FormData();
      dataToSend.set("type", reqType);
      dataToSend.set("fileid", fileid);
      dataToSend.set("key", key);

      const res = await fetch('/api/backend', {
        method: 'POST',
        body: dataToSend
      });

      if(reqType == "download") {
        if (!res.ok) {
          const errorData = await res.json();
          setFeedback({ type: 'error', message: errorData.message || 'Invalid File ID or Key. Please check and try again.' });
          return;
        }

        const filedata = await res.blob();
        
        if (filedata.size === 0) {
          setFeedback({ type: 'error', message: 'File not found. Please check your File ID.' });
          return;
        }

        const url = window.URL.createObjectURL(filedata);

        const disposition = res.headers.get('Content-Disposition');
        let filename = "downloaded-file" as string;
        if (disposition && disposition.includes('filename=')) {
          const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(url);
        
        setFeedback({ type: 'success', message: 'File downloaded successfully!' });
        resetForm();

      } else if (reqType == "delete") {
        if (!res.ok) {
          const errorData = await res.json();
          setFeedback({ type: 'error', message: errorData.message || 'Invalid File ID or Key. Could not delete file.' });
          return;
        }
        const res_json = await res.json();
        setFeedback({ type: 'success', message: res_json.message || 'File deleted successfully!' });
        resetForm();
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-[#FFFFFF] via-[#fdf4f9] to-[#fbe6f1] relative overflow-hidden">
      <BgGradient />

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 z-10 px-8 py-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/20">
        <div className="text-center mb-2">
          <p className="font-inter text-text-main font-bold text-4xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Receive File</p>
          <p className="font-inter text-gray-500 text-sm mt-2">Access your shared files securely</p>
        </div>

        <span className="grid gap-2 w-full">
          <label htmlFor="fid" className="font-inter font-semibold text-text-main text-sm uppercase tracking-wide">📋 Enter File ID</label>
          <input 
            type="text" 
            required 
            name="fid" 
            id="fid" 
            placeholder="Paste your File ID here" 
            value={fileid}
            onChange={(e) => setFileid(e.target.value)} 
            className="outline-none font-inter text-text-main border-2 border-blue-300 rounded-lg py-3 text-center w-full hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-300" 
          />
        </span>

        <span className="grid gap-2 w-full">
          <label htmlFor="pswdone" className="font-inter font-semibold text-text-main text-sm uppercase tracking-wide">🔑 Enter key</label>
          <input 
            required 
            type="password" 
            name="pswdone" 
            id="pswdone" 
            autoComplete="false" 
            placeholder="Your secure key..." 
            value={key}
            onChange={e => setKey(e.target.value)} 
            className="font-inter outline-none text-text-main border-2 border-blue-300 rounded-lg w-full py-3 text-center placeholder-zinc-400 hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-300" 
          />
        </span>

        <div className="w-full grid grid-cols-1 gap-3">
          <button 
            type="submit" 
            name="action"
            value="download"
            onClick={() => setReqtype("download")}
            disabled={isLoading}
            className={`font-roboto font-bold text-white text-[1.1rem] rounded-lg py-3 px-6 w-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all ease-in-out duration-300 font-semibold shadow-lg flex items-center justify-center gap-2 ${isLoading ? 'opacity-60 cursor-not-allowed scale-95' : 'hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer'}`}
          >
            {isLoading ? "Processing... ⏳" : "⬇️ Download File"}
          </button>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent my-2"></div>

        <div className="w-full">
          <p className="font-inter font-semibold text-orange-700 text-sm uppercase tracking-wide mb-3">⚙️ Advanced Settings</p>
          <p className="font-inter text-orange-600 text-xs mb-3 font-medium">Request deletion of file</p>
          <button 
            type="submit" 
            name="action"
            value="delete"
            onClick={() => setReqtype("delete")}
            disabled={isLoading}
            className={`font-roboto font-bold text-white text-[1.1rem] rounded-lg py-3 px-6 w-full bg-gradient-to-r from-red-500 via-red-600 to-orange-600 transition-all ease-in-out duration-300 font-semibold shadow-lg flex items-center justify-center gap-2 ${isLoading ? 'opacity-60 cursor-not-allowed scale-95' : 'hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer'}`}
          >
            {isLoading ? "Processing... ⏳" : "🗑️ Delete File"}
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 mt-4 w-full justify-center">
            <div className="w-5 h-5 border-3 border-blue-600 border-t-cyan-600 rounded-full animate-spin"></div>
            <span className="font-inter text-text-main font-semibold">Processing your request...</span>
          </div>
        )}

        {feedback && (
          <div className={`mt-6 p-4 rounded-lg text-center font-inter w-full animate-in fade-in duration-300 ${
            feedback.type === 'success' 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 shadow-lg' 
              : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-300 shadow-lg'
          }`}>
            <div className="font-semibold mb-2">{feedback.type === 'success' ? '✓ Success!' : '⚠ Error'}</div>
            <div className="text-sm">{feedback.message}</div>
          </div>
        )}

        <Link href="/share" className="font-inter text-blue-600 hover:text-cyan-600 font-semibold text-sm transition-colors duration-300 hover:underline mt-2">
          Want to share a file? Click here →
        </Link>
      </form>

      <BackgroundBeams className="z-0"/>
    </div>
  )
}

export default page