import { NextRequest, NextResponse } from "next/server";
import { addDataDB } from "@/lib/backend";
import { blake3 } from "hash-wasm"
import crypto from "crypto"
import { isBuffer } from "util";
import { hex } from "motion/react";

export async function POST(request: NextRequest) {
  const data = await request.formData();

  const file: File | null = data.get('file') as unknown as File;

  if(!file) return NextResponse.json({succcess: false});

  const fileName = file.name;
  const key = data.get('key') as string;

  // Convert the file to a buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Get the blake3 sum of the key entered
  const mainKey = await blake3(key);
  const encKey = Buffer.from (mainKey, 'hex');

  // // Encrypt the buffer
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', encKey, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const encryptedFileBuffer = Buffer.concat([iv, encrypted]);

  // Upload the encrypted file to discord
  const res = await addDataDB(encryptedFileBuffer, fileName, key);

  if(res) return NextResponse.json({succcess: true, id: res});
  else return NextResponse.json({success: false});

}