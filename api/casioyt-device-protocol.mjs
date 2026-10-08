export const DEVICE_PROTOCOL = Object.freeze({
  version: 1,
  headerSize: 16,
  maxPayload: 5200,
  typeCatalog: 5,
  catalogReset: 1,
  catalogItem: 2,
  catalogDone: 3,
  catalogError: 4,
  resultLimit: 5,
  titleLimit: 56,
  channelLimit: 32,
  videoIdSize: 11,
  thumbnailWidth: 80,
  thumbnailHeight: 45,
  thumbnailBytes: 80 * 45 / 2,
});

export const CASIO_PALETTE = Object.freeze([
  [7, 9, 13], [25, 29, 36], [36, 46, 62], [28, 91, 181],
  [47, 125, 246], [70, 171, 242], [62, 193, 155], [105, 207, 116],
  [238, 194, 74], [242, 139, 55], [226, 90, 79], [188, 76, 169],
  [135, 91, 219], [226, 40, 55], [185, 193, 207], [246, 248, 252],
]);

const encoder = new TextEncoder();
const paletteLut = new Uint8Array(32 * 32 * 32);
const crcTable = new Uint32Array(256);

for (let value = 0; value < crcTable.length; value += 1) {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc >>> 1) ^ ((-(crc & 1)) & 0xedb88320);
  }
  crcTable[value] = crc >>> 0;
}

for (let red = 0; red < 32; red += 1) {
  for (let green = 0; green < 32; green += 1) {
    for (let blue = 0; blue < 32; blue += 1) {
      const r = red * 255 / 31;
      const g = green * 255 / 31;
      const b = blue * 255 / 31;
      let best = 0;
      let distance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < CASIO_PALETTE.length; index += 1) {
        const [pr, pg, pb] = CASIO_PALETTE[index];
        const dr = r - pr;
        const dg = g - pg;
        const db = b - pb;
        const candidate = dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114;
        if (candidate < distance) {
          best = index;
          distance = candidate;
        }
      }
      paletteLut[(red << 10) | (green << 5) | blue] = best;
    }
  }
}

function limitedUtf8(value, limit) {
  const bytes = encoder.encode(String(value || '').replace(/\s+/g, ' ').trim());
  if (bytes.length <= limit) return bytes;
  let end = limit;
  while (end > 0 && (bytes[end] & 0xc0) === 0x80) end -= 1;
  return bytes.slice(0, end);
}

function writeU16(target, offset, value) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeU32(target, offset, value) {
  writeU16(target, offset, value & 0xffff);
  writeU16(target, offset + 2, value >>> 16);
}

function crcContinue(initial, bytes, start, end) {
  let crc = initial >>> 0;
  for (let index = start; index < end; index += 1) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[index]) & 0xff];
  }
  return crc >>> 0;
}

function packetCrc(packet, payloadLength) {
  let crc = crcContinue(0xffffffff, packet, 0, 12);
  crc = crcContinue(crc, packet, DEVICE_PROTOCOL.headerSize,
    DEVICE_PROTOCOL.headerSize + payloadLength);
  return (~crc) >>> 0;
}

export function packDevicePacket(type, sequence, payload = new Uint8Array()) {
  if (!(payload instanceof Uint8Array)) payload = new Uint8Array(payload);
  if (payload.length > DEVICE_PROTOCOL.maxPayload) throw new RangeError('CasioYT payload too large');
  const packet = new Uint8Array(DEVICE_PROTOCOL.headerSize + payload.length);
  packet.set([0x43, 0x59, 0x54, 0x31, DEVICE_PROTOCOL.version, type, 0, 0], 0);
  writeU16(packet, 8, sequence & 0xffff);
  writeU16(packet, 10, payload.length);
  packet.set(payload, DEVICE_PROTOCOL.headerSize);
  writeU32(packet, 12, packetCrc(packet, payload.length));
  return packet;
}

export function rleEncode(source) {
  const output = new Uint8Array(source.length + Math.ceil(source.length / 128) + 16);
  let input = 0;
  let used = 0;
  while (input < source.length) {
    let run = 1;
    while (input + run < source.length && source[input + run] === source[input] && run < 128) run += 1;
    if (run >= 3) {
      output[used++] = 0x80 | (run - 1);
      output[used++] = source[input];
      input += run;
      continue;
    }
    const literalStart = input;
    let count = 0;
    while (input < source.length && count < 128) {
      run = 1;
      while (input + run < source.length && source[input + run] === source[input] && run < 128) run += 1;
      if (count && run >= 3) break;
      if (run >= 3) break;
      const take = Math.min(run, 128 - count);
      count += take;
      input += take;
    }
    if (!count) throw new Error('CasioYT RLE encoder stalled');
    output[used++] = count - 1;
    output.set(source.subarray(literalStart, literalStart + count), used);
    used += count;
  }
  return output.slice(0, used);
}

export function quantizeRgbToPacked(data, width, height, channels = 3) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 ||
      (width * height) % 2 || channels < 3 || data.length < width * height * channels) {
    throw new RangeError('Unexpected thumbnail pixels');
  }
  const packed = new Uint8Array(width * height / 2);
  for (let pixel = 0, output = 0; pixel < width * height; pixel += 2, output += 1) {
    const first = pixel * channels;
    const second = first + channels;
    const left = paletteLut[((data[first] >> 3) << 10) |
      ((data[first + 1] >> 3) << 5) | (data[first + 2] >> 3)];
    const right = paletteLut[((data[second] >> 3) << 10) |
      ((data[second + 1] >> 3) << 5) | (data[second + 2] >> 3)];
    packed[output] = (left << 4) | right;
  }
  return packed;
}

export function fallbackThumbnail(seed = 0) {
  const pixels = new Uint8Array(DEVICE_PROTOCOL.thumbnailBytes);
  for (let y = 0; y < DEVICE_PROTOCOL.thumbnailHeight; y += 1) {
    for (let x = 0; x < DEVICE_PROTOCOL.thumbnailWidth; x += 2) {
      let left = 1 + ((x / 10 + y / 9 + seed) % 5);
      let right = 1 + (((x + 1) / 10 + y / 9 + seed) % 5);
      const inPlay = y >= 13 && y <= 31 && x >= 31 && x <= 51;
      if (inPlay && x <= 31 + (y < 22 ? y - 12 : 32 - y)) left = right = 15;
      pixels[(y * DEVICE_PROTOCOL.thumbnailWidth + x) / 2] = (left << 4) | right;
    }
  }
  return pixels;
}

export function catalogPackets(generation, items) {
  const packets = [];
  let sequence = 1;
  packets.push(packDevicePacket(DEVICE_PROTOCOL.typeCatalog, sequence++, new Uint8Array([
    DEVICE_PROTOCOL.catalogReset,
    generation & 0xff,
    (generation >>> 8) & 0xff,
    items.length & 0xff,
  ])));

  items.forEach((item, index) => {
    if (!/^[A-Za-z0-9_-]{11}$/.test(item.videoId || '')) return;
    const title = limitedUtf8(item.title, DEVICE_PROTOCOL.titleLimit);
    const channel = limitedUtf8(item.channel, DEVICE_PROTOCOL.channelLimit);
    const thumbnail = item.thumbnail instanceof Uint8Array
      ? item.thumbnail
      : fallbackThumbnail(index);
    if (thumbnail.length !== DEVICE_PROTOCOL.thumbnailBytes) return;
    const compressed = rleEncode(thumbnail);
    const payload = new Uint8Array(21 + title.length + channel.length + compressed.length);
    payload[0] = DEVICE_PROTOCOL.catalogItem;
    writeU16(payload, 1, generation);
    payload[3] = index;
    writeU16(payload, 4, Math.min(0xffff, Number(item.durationSeconds) || 0));
    payload[6] = title.length;
    payload[7] = channel.length;
    payload.set(encoder.encode(item.videoId), 8);
    writeU16(payload, 19, compressed.length);
    payload.set(title, 21);
    payload.set(channel, 21 + title.length);
    payload.set(compressed, 21 + title.length + channel.length);
    packets.push(packDevicePacket(DEVICE_PROTOCOL.typeCatalog, sequence++, payload));
  });

  packets.push(packDevicePacket(DEVICE_PROTOCOL.typeCatalog, sequence,
    new Uint8Array([DEVICE_PROTOCOL.catalogDone, generation & 0xff, (generation >>> 8) & 0xff])));
  return packets;
}

export function concatPackets(packets) {
  const size = packets.reduce((total, packet) => total + packet.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  for (const packet of packets) {
    output.set(packet, offset);
    offset += packet.length;
  }
  return output;
}
