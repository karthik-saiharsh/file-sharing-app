"use server";

import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import { neon } from "@neondatabase/serverless";
import { createHash } from "crypto";
import { blake3 } from "hash-wasm";
import crypto from "crypto"

///// Global Variables /////
let botInitialised = false;
let client: Client;

//// Helper Functions
async function initBot(): Promise<void> {
  if (botInitialised) return;

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  return new Promise((resolve, reject) => {
    client.once("ready", () => {
      botInitialised = true;
      console.log("Bot initialised Successfully!");
      resolve();
    });

    client.login(`${process.env.DISCORD_TOKEN}`).catch(reject);
  });
}

async function sendData(message: string, file: Buffer, fileName: string) {
  if (!botInitialised) {
    await initBot();
  }

  const channel = (await client.channels.cache.get(`${process.env.DISCORD_CHANNEL_ID}`)) as TextChannel;

  try {
    if (channel && channel.isTextBased()) {
      const messageSent = await channel.send({
        content: message,
        files: [{ attachment: file, name: fileName }],
      });
      return messageSent.id;
    }
  } catch (e) {
    console.log(e);
    return "fail";
  } finally {
    client.destroy();
  }
}

function generateFileID(): string {
  const alphas = "abcdefghijklmnopqrstuvwxyz";
  const nums = "0123456789";
  const chars = alphas + nums + alphas.toUpperCase();

  let fileID = "";

  while (fileID.length < 5) {
    fileID += chars[Math.floor(Math.random() * 62) % 62];
  }
  return fileID;
}

function getSHA256(str: string) {
  return `${createHash("sha256").update(str).digest("hex")}`;
}

async function fetchFileURL(msgID: string) {
  if (!botInitialised) {
    await initBot();
  }

  const channel = (await client.channels.cache.get(`${process.env.DISCORD_CHANNEL_ID}`)) as TextChannel;

  const message = await channel.messages.fetch(msgID);
  const file_url = await message.attachments.first()?.url || "";
  const file_name = await message.attachments.first()?.name || "";
  const file_contentType = await message.attachments.first()?.contentType || "";
  client.destroy();
  return {url: file_url, name: file_name, type: file_contentType};
}

async function fetchMessageIDandKEYSum(fileID: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  const result = await sql`select msgID, decKey from filesharingapp where fileID=${fileID}`;
  let retvalue: Record<string, any> = {};
  result.forEach(val => retvalue = val);
  return retvalue;
}

async function addDataDB(file: Buffer, fileName: string, key: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  // create a new fileID
  let fileId = generateFileID();

  const result =
    await sql`SELECT EXISTS (SELECT 1 FROM filesharingapp WHERE fileID = ${fileId})`;

  if (!result[0].exists) {
    try {
      const msgStat = await sendData(fileId, file, fileName);
      if (msgStat != "fail") {
        await sql`insert into filesharingapp values(${fileId}, ${msgStat}, ${getSHA256(key)})`;
        return fileId;
      }
    } catch (_) {
      return false;
    }
  } else {
    return addDataDB(file, fileName, key);
  }
}

async function getOriginalFileURL(fileId: string, key: string) {
  const file_metadata = await fetchMessageIDandKEYSum(fileId);
  const keysum = getSHA256(key);

  if(keysum != file_metadata.deckey) {
    return "fail";
  }

  const fileData = await fetchFileURL(file_metadata.msgid);
  return fileData;
}

// Main exposed Functions //
export async function uploadFile(data: FormData) {
  const file: File | null = data.get('file') as unknown as File;

  if(!file) return "fail"

  const fileName = file.name;
  const key = data.get('key') as string;

  // Convert the file to a buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Get the blake3 sum of the key entered
  const mainKey = await blake3(key);
  const encKey = Buffer.from(mainKey, 'hex');

  // // Encrypt the buffer
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', encKey, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const encryptedFileBuffer = Buffer.concat([iv, encrypted]);

  // Upload the encrypted file to discord
  const res = await addDataDB(encryptedFileBuffer, fileName, key);

  if(!res) return "fail"
  else return {status: "success", fileid: res}
}


export async function downloadFile(data: FormData) {
  const fileID = data.get("fileid") as string;
  const key = data.get("key") as string;

  const file_data = await getOriginalFileURL(fileID, key);
  if(file_data === "fail") return "fail";

  const fileContent = await fetch(file_data.url);

  if(!fileContent.ok) return "fail";

  const arrayBuffer = await fileContent.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const mainKey = await blake3(key);
  const decKey = Buffer.from(mainKey, 'hex');

  // Decrypt the file
  const iv = buffer.slice(0, 16);
  const encryptedData = buffer.slice(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', decKey, iv);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);

  return {file_info: file_data, decData: decrypted};
}