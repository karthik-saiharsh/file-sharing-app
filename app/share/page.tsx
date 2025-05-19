"use client";

import BgGradient from "../ui/bg-gradient";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";
import { useState } from "react";



const page = () => {

  const [file, setFile] = useState<File>();
  const [key1, setKey1] = useState<string>("");
  const [key2, setKey2] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if(!file) alert("Please upload a file");
    else if(key1?.trim() != key2?.trim()) alert("Keys must match");
    else if (key1.trim() == "" || key2.trim() == "") alert("Key can't be empty");
    else if(file.name.length > 100) alert("Your File Name cannot be longer than 100 characters");
    else if(file.size > 100 * 1024 * 1024) alert("Upload Files Smaller than 100MB");
    else {
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
        alert(`File Uploaded Successfully!\nYour FileID is ${res_json.fileid}.\nYou will need this to recieve your file on the other end`);
      }
      else {
        alert("An error occurred!");
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full bg-gradient-to-b from-[#FFFFFF] to-[#fbe6f1] max-sm:h-[165vh] max-sm:w-[160vw]">
      
      <BgGradient />

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5 z-10 px-15 py-20 bg-card">
        <p className="font-inter text-text-main font-bold text-3xl">Share File</p>

        <span className="grid gap-1">
          <label htmlFor="fileup" className="font-inter font-semibold text-text-main">Upload a file</label>
          <input required type="file" name="fileup" id="fileup" onChange={(e) => {setFile(e.target.files?.[0])}} className="font-inter text-text-main border-text-main border-3 rounded-md py-2 text-center w-100" />
        </span>

        <span className="grid gap-1">
          <label htmlFor="pswdone" className="font-inter font-semibold text-text-main">Enter a key</label>
          <input required type="password" name="pswdone" id="pswdone" onChange={(e) => {setKey1(e.target.value)}} autoComplete="false" placeholder="Your Key..." className="font-inter outline-none text-text-main border-text-main border-3 rounded-md w-100 py-2 text-center placeholder-zinc-400" />
        </span>

        <span className="grid gap-1">
          <label htmlFor="pswdtwo" className="font-inter font-semibold text-text-main">Confirm key</label>
          <input required type="password" name="pswdtwo" id="pswdtwo" onChange={(e) => {setKey2(e.target.value)}} autoComplete="false" placeholder="Your Key..." className="font-inter outline-none text-text-main border-text-main border-3 rounded-md w-100 py-2 text-center placeholder-zinc-400" />
        </span>

        <input type="submit" value="Get a Link 🔗" className="cursor-pointer font-roboto font-bold text-background text-[1.2rem] mt-5 rounded-md px-35 py-2 bg-btn transition-all ease-in-out duration-200 hover:scale-110" id="submit-btn" />
        <Link href="/recieve" className="font-inter text-text-main">Want to view/delete a shared file? Click here</Link>
      </form>

        <BackgroundBeams className="z-0"/>
    </div>
  )
}

export default page