"use client";

import BgGradient from "../ui/bg-gradient";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";
import { useState } from "react";

const page = () => {
  const [file, setFile] = useState<File | undefined>();
  const [key1, setKey1] = useState<string>("");
  const [key2, setKey2] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const resetForm = () => {
    setFile(undefined);
    setKey1("");
    setKey2("");
    setFeedback(null);
    const fileInput = document.getElementById("fileup") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    
    if(!file) {
      setFeedback({ type: 'error', message: 'Please upload a file' });
      return;
    }
    else if(key1?.trim() !== key2?.trim()) {
      setFeedback({ type: 'error', message: 'Keys must match' });
      return;
    }
    else if (key1.trim() === "" || key2.trim() === "") {
      setFeedback({ type: 'error', message: "Key can't be empty" });
      return;
    }
    else if(file.name.length > 100) {
      setFeedback({ type: 'error', message: 'Your File Name cannot be longer than 100 characters' });
      return;
    }
    else if((file.size/1024)/1024 > 4.50) {
      setFeedback({ type: 'error', message: 'Upload Files Smaller than 4.5MB' });
      return;
    }
    else {
      setIsLoading(true);
      try {
        const dataToSend = new FormData();
        dataToSend.set("type", "upload");
        dataToSend.set("file", file);
        dataToSend.set("key", key1);

        const res = await fetch("/api/backend", {
          method: 'POST',
          body: dataToSend,
        });

        const res_json = await res.json();

        if (res_json.success) {
          setFeedback({ 
            type: 'success', 
            message: `File Uploaded Successfully!\nYour FileID is ${res_json.fileid}.\nYou will need this to recieve your file on the other end` 
          });
          resetForm();
        }
        else {
          setFeedback({ type: 'error', message: 'An error occurred!' });
        }
      } catch (error) {
        setFeedback({ type: 'error', message: 'An error occurred during upload!' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-[#FFFFFF] via-[#fdf4f9] to-[#fbe6f1] relative overflow-hidden">
      <BgGradient />

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 z-10 px-8 py-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/20">
        <div className="text-center mb-2">
          <p className="font-inter text-text-main font-bold text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Share File</p>
          <p className="font-inter text-gray-500 text-sm mt-2">Secure file sharing with encryption</p>
        </div>

        <span className="grid gap-2 w-full">
          <label htmlFor="fileup" className="font-inter font-semibold text-text-main text-sm uppercase tracking-wide">📁 Upload a file</label>
          <input 
            required 
            type="file" 
            name="fileup" 
            id="fileup" 
            onChange={(e) => {setFile(e.target.files?.[0] ?? undefined)}}
            className="font-inter text-text-main border-2 border-purple-300 rounded-lg py-3 text-center w-full hover:border-purple-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all duration-300 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:text-white file:cursor-pointer hover:file:opacity-90" 
          />
          {file && <p className="text-xs text-green-600 font-semibold">✓ {file.name}</p>}
        </span>

        <span className="grid gap-2 w-full">
          <label htmlFor="pswdone" className="font-inter font-semibold text-text-main text-sm uppercase tracking-wide">🔑 Enter a key</label>
          <input 
            required 
            type="password" 
            name="pswdone" 
            id="pswdone" 
            value={key1}
            onChange={(e) => {setKey1(e.target.value)}}
            autoComplete="false" 
            placeholder="Your secure key..." 
            className="font-inter outline-none text-text-main border-2 border-purple-300 rounded-lg w-full py-3 text-center placeholder-zinc-400 hover:border-purple-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all duration-300" 
          />
        </span>

        <span className="grid gap-2 w-full">
          <label htmlFor="pswdtwo" className="font-inter font-semibold text-text-main text-sm uppercase tracking-wide">✓ Confirm key</label>
          <input 
            required 
            type="password" 
            name="pswdtwo" 
            id="pswdtwo" 
            value={key2}
            onChange={(e) => {setKey2(e.target.value)}}
            autoComplete="false" 
            placeholder="Confirm your key..." 
            className="font-inter outline-none text-text-main border-2 border-purple-300 rounded-lg w-full py-3 text-center placeholder-zinc-400 hover:border-purple-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all duration-300" 
          />
          {key1 && key2 && key1 === key2 && <p className="text-xs text-green-600 font-semibold">✓ Keys match</p>}
        </span>

        <input 
          type="submit" 
          value={isLoading ? "Uploading... 🔗" : "Get a Link 🔗"} 
          disabled={isLoading}
          className={`font-roboto font-bold text-white text-[1.1rem] mt-6 rounded-lg px-10 py-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all ease-in-out duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg ${isLoading ? 'opacity-60 cursor-not-allowed scale-95' : 'hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer'}`} 
          id="submit-btn" 
        />

        {isLoading && (
          <div className="flex items-center gap-3 mt-4 w-full justify-center">
            <div className="w-5 h-5 border-3 border-purple-600 border-t-pink-600 rounded-full animate-spin"></div>
            <span className="font-inter text-text-main font-semibold">Processing your file...</span>
          </div>
        )}

        {feedback && (
          <div className={`mt-6 p-4 rounded-lg text-center font-inter w-full animate-in fade-in duration-300 ${
            feedback.type === 'success' 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 shadow-lg' 
              : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-300 shadow-lg'
          }`}>
            <div className="font-semibold mb-2">{feedback.type === 'success' ? '✓ Success!' : '⚠ Error'}</div>
            {feedback.message.split('\n').map((line, idx) => (
              <div key={idx} className="text-sm">{line}</div>
            ))}
          </div>
        )}

        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent my-2"></div>

        <Link href="/recieve" className="font-inter text-purple-600 hover:text-pink-600 font-semibold text-sm transition-colors duration-300 hover:underline">
          Want to view/delete a shared file? Click here →
        </Link>
      </form>

      <BackgroundBeams className="z-0"/>
    </div>
  )
}

export default page;
