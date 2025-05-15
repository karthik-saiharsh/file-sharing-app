"use server";

import { neon } from "@neondatabase/serverless";
import { createHash } from "crypto";
import { blake3 } from "hash-wasm";
import crypto from "crypto"

///// Global Variables /////
const sql = neon(`${process.env.DATABASE_URL}`);

//// Helper Functions
function generateFileID(): string {
  const alphas = "abcdefghijklmnopqrstuvwxyz";
  const nums = "0123456789";
  const chars = alphas + nums + alphas.toUpperCase();

  let fileID = "";

  while (fileID.length < 4) {
    fileID += chars[Math.floor(Math.random() * 62) % 62];
  }
  return fileID;
}

function getSHA256(str: string) {
  return `${createHash("sha256").update(str).digest("hex")}`;
}

async function fetchMessageIDandKEYSum(fileID: string) {
  const result = await sql`select msgID, decKey from filesharingapp where fileID=${fileID}`;
  let retvalue: Record<string, any> = {};
  result.forEach(val => retvalue = val);
  return retvalue;
}

// Main exposed Functions //
export async function uploadFile(data: FormData) {
  // create a new fileID
  let fileId = generateFileID();

  // Check if the file id already exists
  const result = await sql`SELECT EXISTS (SELECT 1 FROM filesharingapp WHERE fileID = ${fileId})`;

  if (result[0].exists) {
    // If file exists, try with a new fileID
    return await uploadFile(data);
  } 
  else {
    const file: File | null = data.get('file') as unknown as File;
    if(!file) return "fail"
    const key = data.get('key') as string;

    const dataToSend = new FormData();
    dataToSend.set("filedata", file);
    dataToSend.set("message", fileId);
    dataToSend.set("key", key);

    // Upload file to Discord server after encrypting it
    const response = await fetch(`${process.env.DB_BOT_URL}/api/upload`,
       {
        method: 'POST',
        body: dataToSend
       });

      if(response.ok)  {
        const response_json = await response.json();
        const msgID = response_json.msgid;

        // Upload the metadata to database
        await sql`insert into filesharingapp values(${fileId}, ${msgID}, ${getSHA256(key)})`;

        return {status: "success", fileid: fileId};
      }
      else return "fail";
  }  
}


// Download the file from the database
export async function downloadFile(data: FormData) {
  const fileID = data.get("fileid") as string;
  const key_entered = data.get("key") as string;
  const key_entered_sum = getSHA256(key_entered);
  

  const stored_file_info = await fetchMessageIDandKEYSum(fileID);


  if(key_entered_sum != stored_file_info.deckey) {
    return "fail";
  }

  const dataToSend = new FormData()
  dataToSend.set("msgid", stored_file_info.msgid)

  const response = await fetch(`${process.env.DB_BOT_URL}/api/download`, {
    method: 'POST',
    body: dataToSend
  })


  if(!response.ok) return "fail";

  const file_metadata = await response.json();

  const fileContent = await fetch(file_metadata.url);

  if(!fileContent.ok) return "fail";

  const arrayBuffer = await fileContent.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const mainKey = await blake3(key_entered);
  const decKey = Buffer.from(mainKey, 'hex');

  // Decrypt the file
  const iv = buffer.slice(0, 16);
  const encryptedData = buffer.slice(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', decKey, iv);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);

  return {file_info: file_metadata, decData: decrypted};
}
