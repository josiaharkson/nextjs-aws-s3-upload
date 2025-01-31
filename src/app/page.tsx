"use client";

import React from "react";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const Bucket = "BUCKET_NAME";
const s3 = new S3Client({
  region: "AWS_REGION",
  credentials: {
    accessKeyId: "AWS_ACCESS_KEY_ID",
    secretAccessKey: "AWS_SECRET_KEY",
  },
});

function removeQueryParameters(signedUrl: string) {
  const url = `${signedUrl}`;

  // Create a URL object from the provided string
  const urlObject = new URL(url);

  // Clear the search parameters (query string)
  urlObject.search = "";

  // Return the URL string without query parameters
  return urlObject.toString();
}

export default function Home() {
  const uploadFileToAWS = async ({
    event,
  }: {
    event: React.ChangeEvent<HTMLInputElement>;
  }) => {
    const files = event.target.files;
    try {
      if (files && files?.length > 0) {
        const file = files[0];

        const buffer = Buffer.from(await file?.arrayBuffer?.());
        const fileKey = `${file?.name}-${Date.now()}`;

        const command = new PutObjectCommand({
          Bucket,
          Key: fileKey,
          Body: buffer,
          ContentType: file?.type,
          ACL: "public-read",
        });

        await s3.send(command);
        const signedUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket, Key: fileKey }),
          { expiresIn: 3600 }
        );

        const url = removeQueryParameters(signedUrl);
        alert(url);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-[20px] flex-wrap maxw-[1200px] mx-auto p-[50px] py-[200px]">
          <input
            type="file"
            className=""
            accept="image/*"
            onChange={(e: any) => {
              uploadFileToAWS({ event: e });
              e.target.value = null;
            }}
          />
        </div>
      </main>
    </div>
  );
}
