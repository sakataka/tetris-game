import type { Writable } from 'node:stream';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import { renderToPipeableStream } from 'react-dom/server';
import { ServerRouter } from 'react-router';
import type { EntryContext } from 'react-router';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext?: unknown
) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onShellReady() {
          const body = new ReadableStream({
            start(controller) {
              pipe({
                write(chunk: unknown) {
                  controller.enqueue(chunk);
                },
                end() {
                  controller.close();
                },
              } as Writable);
            },
          });

          responseHeaders.set('Content-Type', 'text/html');
          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          console.error(error);
        },
      } satisfies RenderToPipeableStreamOptions
    );

    setTimeout(abort, 5000);
  });
}
