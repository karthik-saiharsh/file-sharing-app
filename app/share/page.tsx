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
            filePath: formData.get('fileup'),
            pswd1: formData.get('pswdone'),
            pswd2: formData.get('pswdtwo'),
          };

          console.log(data);

        }} className="flex flex-col items-center gap-5 z-10 px-15 py-20 bg-card">
          <p className="font-inter text-text-main font-bold text-3xl">Share File</p>

          <span className="grid gap-1">
            <label htmlFor="fileup" className="font-inter font-semibold text-text-main">Upload a file</label>
            <input required type="file" name="fileup" id="fileup" className="font-inter text-text-main border-text-main border-3 rounded-md py-2 text-center w-100" />
          </span>

          <span className="grid gap-1">
            <label htmlFor="pswdone" className="font-inter font-semibold text-text-main">Enter a key</label>
            <input required type="password" name="pswdone" id="pswdone" autoComplete="false" placeholder="Your Key..." className="font-inter outline-none text-text-main border-text-main border-3 rounded-md w-100 py-2 text-center placeholder-zinc-400" />
          </span>

          <span className="grid gap-1">
            <label htmlFor="pswdtwo" className="font-inter font-semibold text-text-main">Confirm key</label>
            <input required type="password" name="pswdtwo" id="pswdtwo" autoComplete="false" placeholder="Your Key..." className="font-inter outline-none text-text-main border-text-main border-3 rounded-md w-100 py-2 text-center placeholder-zinc-400" />
          </span>

          <input type="submit" value="Get a Link 🔗" className="cursor-pointer font-roboto font-bold text-background text-[1.2rem] mt-5 rounded-md px-35 py-2 bg-btn transition-all ease-in-out duration-200 hover:scale-110" id="submit-btn" />
          <Link href="/recieve" className="font-inter text-text-main">Looking to view/delete a shared file? Click here</Link>
        </form>

        <BackgroundBeams className="z-0"/>
    </div>
  )
}

export default page