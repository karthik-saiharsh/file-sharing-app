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
    <div className="flex flex-col justify-center items-center h-full bg-gradient-to-b from-[#FFFFFF] to-[#fbe6f1]">
      <BgGradient />

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5 z-10 px-15 py-20 bg-card">
        <p className="font-inter text-text-main font-bold text-3xl">Share File</p>

        <span className="grid gap-1">
          <label htmlFor="fileup" className="font-inter font-semibold text-text-main">Upload a file</label>
          <input 
            required 
            type="file" 
            name="fileup" 
            id="fileup" 
            onChange={(e) => {setFile(e.target.files?.[0] ?? undefined)}}
            className="font-inter text-text-main border-text-main border-3 rounded-md py-2 text-center w-100" 
          />
        </span>

        <span className="grid gap-1">
          <label htmlFor="pswdone" className="font-inter font-semibold text-text-main">Enter a key</label>
          <input 
            required 
            type="password" 
            name="pswdone" 
            id="pswdone" 
            onChange={(e) => {setKey1(e.target.value)}}
            autoComplete="false" 
            placeholder="Your Key..." 
            className="font-inter outline-none text-text-main border-text-main border-3 rounded-md w-100 py-2 text-center placeholder-zinc-400" 
          />
        </span>

        <span className="grid gap-1">
          <label htmlFor="pswdtwo" className="font-inter font-semibold text-text-main">Confirm key</label>
          <input 
            required 
            type="password" 
            name="pswdtwo" 
            id="pswdtwo" 
            onChange={(e) => {setKey2(e.target.value)}}
            autoComplete="false" 
            placeholder="Your Key..." 
            className="font-inter outline-none text-text-main border-text-main border-3 rounded-md w-100 py-2 text-center placeholder-zinc-400" 
          />
        </span>

        <input 
          type="submit" 
          value={isLoading ? "Uploading... 🔗" : "Get a Link 🔗"} 
          disabled={isLoading}
          className={`font-roboto font-bold text-background text-[1.2rem] mt-5 rounded-md px-35 py-2 bg-btn transition-all ease-in-out duration-200 flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-110 cursor-pointer'}`} 
          id="submit-btn" 
        />
        {isLoading && (
          <div className="flex items-center gap-2 mt-3">
            <div className="w-4 h-4 border-2 border-text-main border-t-transparent rounded-full animate-spin"></div>
            <span className="font-inter text-text-main">Processing your file...</span>
          </div>
        )}
        {feedback && (
          <div className={`mt-5 p-4 rounded-md text-center font-inter ${
            feedback.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {feedback.message.split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}
        <Link href="/recieve" className="font-inter text-text-main">Want to view/delete a shared file? Click here</Link>
      </form>

      <BackgroundBeams className="z-0"/>
    </div>
  )
}

export default page;
