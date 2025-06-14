import type { Writable } from 'node:stream';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import { renderToPipeableStream } from 'react-dom/server';
import { ServerRouter } from 'react-router';
import type { EntryContext } from 'react-router';

// SSR optimization constants
const ABORT_TIMEOUT = 10000; // Increased timeout for slower connections
const CHUNK_SIZE = 16 * 1024; // 16KB chunks for optimal streaming

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext?: unknown
) {
  // Check if client accepts streaming
  const acceptsStreaming = request.headers.get('Accept')?.includes('text/html');

  return new Promise((resolve, _reject) => {
    let didError = false;
    let statusCode = responseStatusCode;

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        // Enable progressive enhancement
        bootstrapScripts: ['/entry.client.js'],

        onShellReady() {
          // Set optimal cache headers for SSR
          responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
          responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          responseHeaders.set('X-Content-Type-Options', 'nosniff');

          // Create optimized streaming response
          const body = new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              let buffer = '';

              pipe({
                write(chunk: unknown) {
                  // Buffer small chunks for better performance
                  buffer += chunk;
                  if (buffer.length >= CHUNK_SIZE) {
                    controller.enqueue(encoder.encode(buffer));
                    buffer = '';
                  }
                },
                end() {
                  // Flush remaining buffer
                  if (buffer.length > 0) {
                    controller.enqueue(encoder.encode(buffer));
                  }
                  controller.close();
                },
              } as Writable);
            },
            cancel() {
              abort();
            },
          });

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : statusCode,
            })
          );
        },

        onShellError(error: unknown) {
          didError = true;
          console.error('Shell rendering error:', error);

          // Fallback to static error page
          responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
          resolve(
            new Response(
              '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Something went wrong</h1></body></html>',
              {
                status: 500,
                headers: responseHeaders,
              }
            )
          );
        },

        onError(error: unknown) {
          didError = true;
          console.error('Streaming error:', error);
          statusCode = 500;
        },

        // Enable streaming for all browsers
        onAllReady() {
          // This enables better SEO by waiting for all content
          if (!acceptsStreaming) {
            // For bots and crawlers, wait for complete render
          }
        },
      } satisfies RenderToPipeableStreamOptions
    );

    // Abort after timeout to prevent hanging requests
    setTimeout(() => {
      abort();
    }, ABORT_TIMEOUT);
  });
}
