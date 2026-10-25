export async function limitedText(request:Request,limit:number){
 if(!request.body)return "";
 const reader=request.body.getReader();const chunks:Uint8Array[]=[];let length=0;
 while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>limit){await reader.cancel();throw new Error("REQUEST_TOO_LARGE");}chunks.push(value);}
 return Buffer.concat(chunks).toString("utf8");
}
