'use client';

import BgGradient from "../ui/bg-gradient";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";

import React from 'react'

const page = () => {

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const key = formData.get("pswdone") as string;
    const fileID = formData.get("fid") as string;

    const data = new FormData();
    data.set("type", 'download');
    data.set("fileid", fileID);
    data.set("key", key);

    const res = await fetch('api/upload', {
      method: 'POST',
      body: data
    })

    if(!res.ok) throw new Error(await res.text());

    const disposition = res.headers.get('Content-Disposition');
    let filename = `File_${fileID}`; // fallback filename

    // Get filename from headers of the response
    if (disposition && disposition.includes('filename=')) {
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
  
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col justify-center items-center h-full bg-gradient-to-b from-[#FFFFFF] to-[#fbe6f1] max-sm:h-[165vh] max-sm:w-[160vw]">
        <BgGradient />
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5 z-10 px-15 py-15 bg-card">
          <p className="font-inter text-text-main font-bold text-3xl">Recieve File</p>

          <span className="grid gap-1">
            <label htmlFor="fid" className="font-inter font-semibold text-text-main">Enter File ID</label>
            <input type="text" required name="fid" id="fid" placeholder="Enter File ID" className="outline-none font-inter text-text-main border-text-main border-3 rounded-md py-2 text-center w-100" />
          </span>

          <span className="grid gap-1">
            <label htmlFor="pswdone" className="font-inter font-semibold text-text-main">Enter key</label>
            <input required type="password" name="pswdone" id="pswdone" autoComplete="false" placeholder="Your Key..." className="font-inter outline-none text-text-main border-text-main border-3 rounded-md w-100 py-2 text-center placeholder-zinc-400" />
          </span>

          <input type="submit" name="submit" value="Download File" className="cursor-pointer font-roboto font-bold text-background text-[1.2rem] mt-5 rounded-md px-35 py-2 bg-btn transition-all ease-in-out duration-200 hover:scale-110" id="submit-btn" />


          <span className="grid">
            <label htmlFor="fidel" className="font-inter font-semibold text-orange-700">Advanced Settings</label>
            <label className="font-inter text-orange-700">Request Deletion of File</label>
            <input type="submit" name="submit" value="Delete File" className="cursor-pointer font-roboto font-bold text-background text-[1.2rem] mt-5 rounded-md w-100 py-2 bg-linear-90 from-red-500 to-red-700 transition-all ease-in-out duration-200 hover:scale-110" id="submit-btn" />
          </span>

          <Link href="/share" className="font-inter text-text-main">Looking to shared file? Click here</Link>
        </form>

        <BackgroundBeams className="z-0"/>
    </div>
  )
}

export default page