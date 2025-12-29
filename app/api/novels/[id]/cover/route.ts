import { NextRequest, NextResponse } from "next/server";
import db, { initDb } from "../../../../db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  await initDb();

  const { id } = await context.params;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "INVALID_FILE" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const key = `covers/${id}.jpg`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "STORAGE_UPLOAD_FAILED" },
      { status: 500 }
    );
  }

  const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;

  await db.query(
    "UPDATE novels SET cover_url = $1 WHERE id = $2",
    [publicUrl, id]
  );

  return NextResponse.json({ cover_url: publicUrl });
}
