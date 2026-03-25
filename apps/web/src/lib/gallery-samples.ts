/**
 * Default gallery sample image URLs.
 * These are served from S3 via the backend assets endpoint
 * which streams the file content directly with correct Content-Type headers.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const GALLERY_SAMPLES = [
  `${API_URL}/assets/images/gallery/sample-1.jpg`,
  `${API_URL}/assets/images/gallery/sample-2.jpg`,
  `${API_URL}/assets/images/gallery/sample-3.jpg`,
  `${API_URL}/assets/images/gallery/sample-4.jpg`,
  `${API_URL}/assets/images/gallery/sample-5.jpg`,
  `${API_URL}/assets/images/gallery/sample-6.jpg`,
];
