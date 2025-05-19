import { NextRequest, NextResponse } from "next/server";
import { blake3, sha256 } from "hash-wasm";
import crypto from "crypto";
import { neon } from '@neondatabase/serverless';

const sql = neon(`${process.env.DATABASE_URL}`);

function getFileID(size: number) {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = lower.toUpperCase();
  const nums = "0123456789"

  const charPool = lower + nums + upper;

  let fileid = "" as string;

  while(fileid.length < size) {
    fileid += charPool[Math.floor((Math.random() * charPool.length) % (charPool.length))]
  }

  return fileid;
}


async function encrypt(file: File, key: string) {

  const fileName = file.name;

  const file_ = await file.arrayBuffer();
  const fileBuffer = Buffer.from(file_);

  const key256 = await blake3(key);
  const encKey = Buffer.from(key256, 'hex');

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-cbc', encKey, iv);
  const encrypted = await Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
  const encryptedBuffer = await Buffer.concat([iv, encrypted]);

  return {
    data: encryptedBuffer,
    name: fileName
  };
}

async function decrypt(fileurl: string, key: string) {
  const fileData = await fetch(fileurl, {method: 'GET'});

  const file = await fileData.arrayBuffer();
  const encryptedBuffer = Buffer.from(file);

  const key256 = await blake3(key);
  const decKey = Buffer.from(key256, 'hex');

  const iv = encryptedBuffer.subarray(0, 16);
  const encryptedData = encryptedBuffer.subarray(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', decKey, iv);
  const decryptedBuffer = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

  return decryptedBuffer

}

async function uploadFile(data: Buffer, fileName: string) {

  const file_blob = new Blob([data]);
  
  const form = new FormData();
  form.set("reqtype", "fileupload");
  form.set(" userhash", `${process.env.USR_HASH}`);
  form.set("fileToUpload", file_blob, fileName);

  const res = await fetch(`${process.env.DB_URL}`, {
    method: 'POST',
    body: form
  });

  const URL = await res.text();

  return URL;
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const type = data.get("type") as string;

  if(type == "upload") {

    const fileID = getFileID(4);
    const result = await sql`SELECT EXISTS (SELECT 1 FROM filesharingapp WHERE fileID = ${fileID})`;
    
    if(result[0].exists) return await POST(request);

    const file = data.get("file") as File;
    const key = data.get("key") as string;

    try {
      const encryptedFileData = await encrypt(file, key);

      const fileName = encryptedFileData.name;
      const fileData = encryptedFileData.data
      const fileType = file.type;

      const URL = await uploadFile(fileData, fileName);
      const keyHash = await sha256(key);

      await sql`insert into filesharingapp values(${fileID}, ${URL}, ${keyHash}, ${fileName}, ${fileType})`;

      return NextResponse.json({success: true, fileid: fileID});

    } catch(_) {
      return NextResponse.json({success: false});
    }
  } else if (type == "download") {
    const fileid = data.get("fileid") as string;
    const key = data.get("key") as string;
    const keysum = await sha256(key);

    const result = await sql`select fileurl, deckey, filename, filetype from filesharingapp where fileID=${fileid}`;
    let retvalue: Record<string, any> = {};
    result.forEach(val => retvalue = val);
    
    if(keysum != retvalue.deckey) return new NextResponse("Invalid Key", {status: 418});
    
    const decryptedBuffer = await decrypt(retvalue.fileurl, key);

    const fileName = retvalue.filename as string;
    const fileExtensionPos = fileName.lastIndexOf(".") as number;
    const downloadFileName = `${fileName.substring(0, fileExtensionPos)}_${fileid}${fileName.substring(fileExtensionPos)}`;

    const ret = new NextResponse(decryptedBuffer, {
      status: 200,
      headers: {
        'Content-Type': `${retvalue.filetype}`,
        'Content-Disposition': `attachment; filename="${downloadFileName}"`,
        'Content-Length': decryptedBuffer.length.toString(),
      },
    });

    return ret;
  }
}