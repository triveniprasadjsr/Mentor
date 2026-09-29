import app from '../src/server/app';

export default function handler(req: any, res: any) {
  // If Vercel has already parsed the request body into an object,
  // set req._body = true to prevent Express body-parser from hanging on the consumed stream.
  if (req.body && typeof req.body === 'object') {
    req._body = true;
  }
  return app(req, res);
}
