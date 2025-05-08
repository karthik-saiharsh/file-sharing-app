import BgGradient from "../ui/bg-gradient";

import React from 'react'

const page = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[100vh] bg-gradient-to-b from-[#FFFFFF] to-[#fbe6f1]">
        <BgGradient />
        <h1 className="font-inter font-semibold text-3xl">Project is Still Under Development, Check back later</h1>
    </div>
  )
}

export default page