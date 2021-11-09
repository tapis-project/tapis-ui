import { errorDecoder } from 'tapis-api/utils';
import StreamSaver from 'streamsaver';

const downloadStream = (
  systemId: string,
  path: string,
  destination: string,
  basePath: string,
  jwt: string
): Promise<Response> => {
  const fileStream = StreamSaver.createWriteStream(destination);
  const url = `${basePath}/v3/files/content/${systemId}/${path}`;

  const config = {
      headers: {
          "X-Tapis-Token": jwt
      }
  }

  return errorDecoder<Response>(() => fetch(url, config).then(res => {
    const readableStream = res.body

    // more optimized
    if (window.WritableStream && readableStream?.pipeTo) {
      return readableStream.pipeTo(fileStream)
        .then(() => console.log('done writing'));
    }

    (window as any).writer = fileStream.getWriter();

    const reader = res.body!.getReader();
    const pump = () => reader.read()
      .then(res => res.done
        ? (window as any).writer.close()
        : (window as any).writer.write(res.value).then(pump))

    return pump();
  }));
}

export default downloadStream;
