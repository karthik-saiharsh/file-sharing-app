import Link from "next/link";
import BgGradient from "./ui/bg-gradient";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-[100vh] bg-gradient-to-b from-[#FFFFFF] to-[#FFF2F9]">
      <BgGradient />
      <HeroSection />

      <div className="w-[635px] h-[244px] mt-5 flex justify-center bg-[url(../public/bgHero.png)] bg-cover max-sm:bg-none">
        <Link href={"/share"} className="cursor-pointer hover:scale-[1.1] transition-all ease-in-out flex gap-2 items-center mt-14 bg-btn-bg rounded-xl h-fit m-2 max-sm:shadow-[#EF53AA] max-sm:shadow-2xl">
          <p className="font-jakarta font-semibold text-background pl-8 py-2">Share File</p>
          <img src="/share-icon.png" alt="Share File" className="w-[23px] h-[23px] mr-8" />
        </Link>
      </div>
    </div>
  );
}


function HeroSection() {
  return (
    <div className="flex z-10 flex-col gap-3 text-center">
        <h1 className="p-3 z-10 font-jakarta font-extrabold text-6xl text-center bg-heading select-none max-sm:text-5xl">Seamless Encrypted File Sharing</h1>

        <h2 className="p-3 z-10 font-inter font-bold text-5xl inline-block bg-gradient-to-b from-text-black-grad to-text-white-grad to-105% bg-clip-text text-transparent select-none max-sm:text-3xl">Your Files. Your Key. Your Rules.</h2>

        <p className="font-roboto z-10 text-text-color-subheading select-none max-sm:w-[90%]">
          Your files are encrypted in your browser. You pick the key-we never see a thing. <br />
          No sign-up. No tracking. Just secure, private file transfers. <br />
          Free and open source — the way it should be.
        </p>
    </div>
  );  
}
