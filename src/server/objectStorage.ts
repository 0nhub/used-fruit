import { createHash, createHmac } from "node:crypto";

const EMPTY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const PREFIX = "used-fruit";

export interface ObjectStorageConfig {
  endpoint: URL;
  bucket: string;
  region: string;
  accessKey: string;
  secretKey: string;
}

export function objectStorageConfig(): ObjectStorageConfig | null {
  const endpoint = process.env.HETZNER_S3_ENDPOINT?.trim();
  const bucket = process.env.HETZNER_S3_BUCKET?.trim();
  const accessKey = process.env.HETZNER_S3_ACCESS_KEY?.trim();
  const secretKey = process.env.HETZNER_S3_SECRET_KEY?.trim();
  if (!endpoint || !bucket || !accessKey || !secretKey) return null;
  const url = new URL(endpoint);
  const region = process.env.HETZNER_S3_REGION?.trim() || url.hostname.split(".")[0];
  if (!region || region === url.hostname) throw new Error("Object storage region unavailable");
  return { endpoint: url, bucket, region, accessKey, secretKey };
}

export function isObjectStorageEnabled() {
  return objectStorageConfig() !== null;
}

function encodePath(value: string) {
  return value.split("/").map((part) => encodeURIComponent(part)).join("/");
}

function sha256Hex(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value, "utf8").digest();
}

export function authorizationHeader(input: {
  method: string;
  host: string;
  canonicalUri: string;
  region: string;
  accessKey: string;
  secretKey: string;
  amzDate: string;
  payloadHash: string;
  headers?: Record<string, string>;
}) {
  const headers: Record<string, string> = {
    host: input.host.trim(),
    "x-amz-content-sha256": input.payloadHash,
    "x-amz-date": input.amzDate,
  };
  for (const [name, value] of Object.entries(input.headers ?? {})) headers[name.toLowerCase()] = value.trim().replace(/ +/g, " ");
  const names = Object.keys(headers).sort();
  const canonicalHeaders = names.map((name) => `${name}:${headers[name]}\n`).join("");
  const signedHeaders = names.join(";");
  const canonicalRequest = `${input.method}\n${input.canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${input.payloadHash}`;
  const date = input.amzDate.slice(0, 8);
  const scope = `${date}/${input.region}/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${input.amzDate}\n${scope}\n${sha256Hex(canonicalRequest)}`;
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${input.secretKey}`, date), input.region), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign, "utf8").digest("hex");
  return `AWS4-HMAC-SHA256 Credential=${input.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

function objectRequest(config: ObjectStorageConfig, key: string) {
  const host = `${config.bucket}.${config.endpoint.host}`;
  const canonicalUri = `/${encodePath(key)}`;
  const url = new URL(`${config.endpoint.protocol}//${host}${canonicalUri}`);
  return { host, canonicalUri, url };
}

async function send(method: string, key: string, body?: Buffer, headers?: Record<string, string>) {
  const config = objectStorageConfig();
  if (!config) throw new Error("Object storage unavailable");
  const payload = body ?? Buffer.alloc(0);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const target = objectRequest(config, key);
  const payloadHash = sha256Hex(payload);
  const authorization = authorizationHeader({
    method,
    host: target.host,
    canonicalUri: target.canonicalUri,
    region: config.region,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
    amzDate,
    payloadHash,
    headers,
  });
  const response = await fetch(target.url, {
    method,
    redirect: "error",
    headers: {
      authorization,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      ...headers,
    },
    body: method === "GET" || method === "DELETE" ? undefined : new Uint8Array(payload),
  });
  return response;
}

function safeName(filename: string) {
  if (!/^[a-f0-9-]{36}\.webp$/.test(filename)) throw new Error("Unsafe media name");
}

function liveKey(filename: string) {
  safeName(filename);
  return `${PREFIX}/media/${filename}`;
}

function trashKey(filename: string) {
  safeName(filename);
  return `${PREFIX}/media-trash/${filename}`;
}

export async function putMediaObject(filename: string, body: Buffer) {
  const response = await send("PUT", liveKey(filename), body, { "content-type": "image/webp" });
  if (!response.ok) throw new Error(`object_storage_${response.status}`);
}

export async function readMediaObject(filename: string) {
  const response = await send("GET", liveKey(filename));
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`object_storage_${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function deleteKey(key: string) {
  const response = await send("DELETE", key);
  if (response.status === 404 || response.ok) return;
  throw new Error(`object_storage_${response.status}`);
}

async function copyKey(source: string, target: string) {
  const config = objectStorageConfig();
  if (!config) throw new Error("Object storage unavailable");
  const response = await send("PUT", target, Buffer.alloc(0), {
    "x-amz-copy-source": `/${config.bucket}/${encodePath(source)}`,
  });
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`object_storage_${response.status}`);
  return true;
}

/** Move a deleted image aside for seven days, then remove both copies. */
export async function retireMediaObject(filename: string, purge: boolean) {
  const live = liveKey(filename);
  const trash = trashKey(filename);
  if (!purge) await copyKey(live, trash);
  await deleteKey(live);
  if (purge) await deleteKey(trash);
}

export const emptyPayloadHash = EMPTY_SHA256;
