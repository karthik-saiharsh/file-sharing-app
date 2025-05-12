"use server";

import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import { neon } from '@neondatabase/serverless';
import { createHash } from "crypto";

///// Global Variables /////
let botInitialised = false;
let client: Client;

//// Helper Functions
async function initBot(): Promise<void> {
    if(botInitialised) return;

    client = new Client({ 
        intents: [ 
                GatewayIntentBits.Guilds,  
                GatewayIntentBits.GuildMessages,  
                GatewayIntentBits.MessageContent
            ] 
    }); 

    return new Promise((resolve, reject) => {
        client.once('ready', () => {
            botInitialised = true;
            console.log("Bot initialised Successfully!");
            resolve();
        });

        client.login(process.env.DISCORD_TOKEN).catch(reject); 
    });

}


async function sendData(message: string, file: Buffer, fileName: string) {
    if(!botInitialised) {
        await initBot();
    }

    const channel = await client.channels.cache.get(process.env.DISCORD_CHANNEL_ID as string) as TextChannel;

    try {
        if (channel && channel.isTextBased()) {
            const messageSent = await channel.send({content: message, files: [{attachment: file, name: fileName}]});
            return messageSent.id
        }
    } catch (e) {
        console.log(e);
        return "fail";
    }
    
}


function generateFileID(): string {
    const alphas = "abcdefghijklmnopqrstuvwxyz";
    const nums = "0123456789";
    const chars = alphas + nums + alphas.toUpperCase();

    let fileID = "";

    while(fileID.length < 5) {
        fileID += chars[Math.floor(Math.random() * 62) % 62];
    }
     return fileID;
}

function getSHA256(str: string) {
    return `${createHash('sha256').update(str).digest('hex')}`;
}

//// Main Exposed Functions ////
export async function addDataDB(file: Buffer, fileName:string, key: string) {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // create a new fileID
    let fileId = generateFileID();

    const result = await sql`SELECT EXISTS (SELECT 1 FROM filesharingapp WHERE fileID = ${fileId})`;

    if(!result[0].exists){
        try {
            const msgStat = await sendData(fileId, file, fileName);
            if (msgStat != "fail"){
                await sql`insert into filesharingapp values(${fileId}, ${msgStat}, ${getSHA256(key)})`;
                return fileId;
            }
        } catch(_) {
            return false;
        }
    } else {
        return addDataDB(file, fileName, key);
    }
}