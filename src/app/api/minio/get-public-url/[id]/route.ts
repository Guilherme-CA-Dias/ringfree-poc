import { NextRequest, NextResponse } from "next/server";

/**
 * MinIO Public URL Endpoint
 *
 * NOTE: This endpoint is included for demonstration purposes only in this prototype.
 * It returns a mock presigned URL and does not interact with an actual MinIO instance.
 * In a production environment, this would be replaced with actual MinIO client integration.
 */

interface RouteContext {
	params: Promise<{ id: string }>;
}

interface MinioUrlResponse {
	url: string;
}

// Mock function to generate a MinIO presigned URL
// This is for demonstration purposes only - in production, use actual MinIO client
function generateMockPresignedUrl(id: string): string {
	const endpoint = process.env.MINIO_ENDPOINT || "minio.ringfree.com";
	const port = process.env.MINIO_PORT || "9000";
	const bucketName = process.env.MINIO_BUCKET_NAME || "pbx.ringfree.com";

	// Generate mock query parameters similar to AWS S3 presigned URLs
	const now = new Date();
	const date = now.toISOString().slice(0, 10).replace(/-/g, "");
	const timestamp = now
		.toISOString()
		.slice(0, 19)
		.replace(/[-:]/g, "")
		.replace("T", "T");
	const expires = 3600; // 1 hour

	// Mock signature and credentials (these would be real in production)
	const mockCredential = "psxhOChwgnquTBDy3ja1";
	const mockSignature =
		"b7b732ffb50015466e1e4bc501ad24577c6f0ac79085d2b9ff156d29346ffce2";

	// Construct the object path - assuming ID might be just filename or full path
	// Based on example: pbx.ringfree.com/200/1760739866.8235.mp3
	const objectPath = id.includes("/") ? id : `200/${id}`;

	const queryParams = new URLSearchParams({
		"X-Amz-Algorithm": "AWS4-HMAC-SHA256",
		"X-Amz-Credential": `${mockCredential}/${date}/us-east-1/s3/aws4_request`,
		"X-Amz-Date": timestamp,
		"X-Amz-Expires": expires.toString(),
		"X-Amz-SignedHeaders": "host",
		"X-Amz-Signature": mockSignature,
	});

	return `http://${endpoint}:${port}/${bucketName}/${objectPath}?${queryParams.toString()}`;
}

export async function GET(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;

		if (!id) {
			return NextResponse.json(
				{ error: "ID parameter is required" },
				{ status: 400 }
			);
		}

		const url = generateMockPresignedUrl(id);

		const response: MinioUrlResponse = { url };
		return NextResponse.json(response);
	} catch (error) {
		console.error("Error generating MinIO presigned URL:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
