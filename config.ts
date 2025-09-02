// API key should be set in environment variables for security
export const MY_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

if (!MY_API_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY environment variable. ' +
    'Please add it to your .env file or environment variables.'
  );
}