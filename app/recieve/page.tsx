import BgGradient from "../ui/bg-gradient";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";

import React from 'react'

const page = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full bg-gradient-to-b from-[#FFFFFF] to-[#fbe6f1] max-sm:h-[165vh] max-sm:w-[160vw]">
        <BgGradient />
        
        <form action={async (formData:FormData) => {
          'use server';

          const data = {
            fileID: formData.get('fid'),
            key: formData.get('pswdone'),
            reqType: formData.get("submit"),
          };

          console.log(data);

          if(data.reqType === "Download File")
            console.log("Downloading file...");
          else
            console.log("Scheduling file for deletion...");
            

        }} className="flex flex-col items-center gap-5 z-10 px-15 py-15 bg-card">
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