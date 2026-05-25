export async function extractClipFromBlob(
  sourceBlob: Blob,
  startMs: number,
  endMs: number,
): Promise<Blob> {
  const arrayBuffer = await sourceBlob.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor((startMs / 1000) * sampleRate);
  const endSample = Math.min(
    Math.floor((endMs / 1000) * sampleRate),
    audioBuffer.length,
  );
  const clipLength = Math.max(0, endSample - startSample);

  if (clipLength === 0) {
    await audioCtx.close();
    throw new Error("Clip has zero length");
  }

  const numChannels = audioBuffer.numberOfChannels;
  const clipBuffer = audioCtx.createBuffer(numChannels, clipLength, sampleRate);

  for (let ch = 0; ch < numChannels; ch++) {
    const sourceData = audioBuffer.getChannelData(ch);
    const clipData = clipBuffer.getChannelData(ch);
    for (let i = 0; i < clipLength; i++) {
      clipData[i] = sourceData[startSample + i];
    }
  }

  await audioCtx.close();

  return encodeWav(clipBuffer);
}

function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, "WAVE");

  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);

  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export async function createPreviewUrl(
  sourceBlob: Blob,
  startMs: number,
  endMs: number,
): Promise<string> {
  const clipBlob = await extractClipFromBlob(sourceBlob, startMs, endMs);
  return URL.createObjectURL(clipBlob);
}
