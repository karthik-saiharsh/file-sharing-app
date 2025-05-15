import { NextRequest, NextResponse } from "next/server";
import { uploadFile, downloadFile } from "@/lib/backend";

export async function POST(request: NextRequest) {
  const data = await request.formData();

  const type: string = data.get("type") as string;
  
  if(type === "upload") {
    const res = await uploadFile(data);
    if(res === "fail") return NextResponse.json({success: false});
    else return NextResponse.json({success: true, id: res.fileid,});
  }

  if(type === "download") {
    const res = await downloadFile(data);
    if(res === "fail") return NextResponse.json({success: false});    
    
    return new NextResponse(res.decData, {
      status: 200,
      headers: {
        'Content-Type': `${res.file_info.type}`,
        'Content-Disposition': `attachment; filename="${res.file_info.name}"`,
        'Content-Length': res.decData.length.toString()
      }
    });
  }

}