import {
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { customAlphabet } from "nanoid";
import { prisma } from "~/services";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.B2_APP_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
  endpoint: process.env.B2_SERVER_ENDPOINT!,
  forcePathStyle: true,
  region: process.env.B2_SERVER_REGION!,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

async function updateEventImage(
  eventId: string,
  blurHash: string,
  id: string,
  key: string,
) {
  await prisma.event.update({
    where: { id: eventId },
    data: {
      imageBlurHash: blurHash,
      imageId: id,
      imageKey: key,
    },
  });
}

export async function uploadFileToB2(
  fileBuffer: Buffer,
  eventId?: string,
  blurHash?: string,
) {
  const nanoid = customAlphabet(
    "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ",
    16,
  );
  const key = `${nanoid()}.jpeg`;
  const command = new PutObjectCommand({
    Body: fileBuffer,
    Bucket: process.env.B2_BUCKET_NAME!,
    ContentType: "image/jpeg",
    Key: `${eventId ? "events" : "temp"}/${key}`,
  });
  try {
    const response = await s3.send(command);
    if (response.$metadata.httpStatusCode === 200) {
      console.log(
        "File uploaded successfully:",
        `${eventId ? "events" : "temp"}/${key}`,
      );
      if (eventId && blurHash && response.VersionId) {
        await updateEventImage(eventId, blurHash, response.VersionId, key);
      }
      return { id: response.VersionId, key: key };
    }
    return null;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

export async function deleteFileFromB2(
  key: string,
  id: string,
  eventId?: string,
  pruning?: boolean,
) {
  const safeId = id && id.trim() !== "" ? id : "incorrect-id-match";
  const command = new DeleteObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME!,
    Key: key,
    VersionId: pruning ? undefined : safeId,
  });
  try {
    const response = await s3.send(command);
    if (eventId && eventId !== "") {
      await updateEventImage(eventId, "", "", "");
    }
    if (response.$metadata.httpStatusCode === 204) {
      console.log(`File ${key} deleted`);
    } else {
      console.log(`File ${key} probably not deleted`);
    }
    return null;
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export async function moveFileInB2(key: string, id: string) {
  const copyCommand = new CopyObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME!,
    CopySource: `${process.env.B2_BUCKET_NAME!}/temp/${key}`,
    Key: `events/${key}`,
  });
  try {
    const copyResponse = await s3.send(copyCommand);
    if (copyResponse.$metadata.httpStatusCode === 200) {
      console.log(`File temp/${key} copied as events/${key}`);
      await deleteFileFromB2(`temp/${key}`, id);
    }
    return null;
  } catch (error) {
    console.error("Error moving file:", error);
    return null;
  }
}

function shouldDeleteFile(lastModified?: Date): boolean {
  if (!lastModified) {
    return false;
  }
  const fileAgeInDays =
    (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
  return fileAgeInDays > 1;
}

export async function pruneB2TempFolder() {
  const listCommand = new ListObjectsV2Command({
    Bucket: process.env.B2_BUCKET_NAME!,
    Prefix: "temp/",
  });
  try {
    const { Contents } = await s3.send(listCommand);
    console.log("Attempting to prune B2 temp folder");
    if (Contents) {
      for (const file of Contents) {
        if (file.Key && shouldDeleteFile(file.LastModified)) {
          await deleteFileFromB2(file.Key, "", "", true);
        }
      }
    }
    console.log("Prune attempt done");
  } catch (error) {
    console.error("Error pruning temp/ folder:", error);
  }
}
