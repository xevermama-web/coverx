const DATABASE_NAME = 'coverxpro-local-assets';
const STORE_NAME = 'images';
const RECORD_KEY = 'university-logo';
const FALLBACK_KEY = 'coverxpro_logo_png_v1';
const SIZE = 512;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }
    const request = window.indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open browser storage'));
    request.onblocked = () => reject(new Error('Browser storage is blocked'));
  });
}

async function readDatabaseLogo(): Promise<string | null> {
  const db = await openDatabase();
  try {
    return await new Promise<string | null>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(RECORD_KEY);
      request.onsuccess = () => resolve(typeof request.result === 'string' ? request.result : null);
      request.onerror = () => reject(request.error || new Error('Could not load saved logo'));
    });
  } finally {
    db.close();
  }
}

async function writeDatabaseLogo(logo: string): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(logo, RECORD_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Could not save logo'));
      transaction.onabort = () => reject(transaction.error || new Error('Logo save was interrupted'));
    });
  } finally {
    db.close();
  }
}

export async function loadSavedLogo(): Promise<string | null> {
  try {
    const fromDatabase = await readDatabaseLogo();
    if (fromDatabase) return fromDatabase;
  } catch {
    // Private browsing or restricted storage may block IndexedDB.
  }
  try {
    return localStorage.getItem(FALLBACK_KEY);
  } catch {
    return null;
  }
}

export async function saveLogo(logo: string): Promise<void> {
  try {
    await writeDatabaseLogo(logo);
    try { localStorage.removeItem(FALLBACK_KEY); } catch { /* No fallback cleanup. */ }
  } catch {
    try {
      localStorage.setItem(FALLBACK_KEY, logo);
    } catch {
      throw new Error('Browser storage is unavailable. The new logo will not persist after closing this page.');
    }
  }
}

export function prepareLogo(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
    return Promise.reject(new Error('Choose a PNG, JPG, WEBP, or GIF logo.'));
  }
  if (file.size > 8 * 1024 * 1024) {
    return Promise.reject(new Error('Please choose a logo smaller than 8 MB.'));
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Image processing is unavailable in this browser.');
        const mid = SIZE / 2;
        const radius = SIZE / 2 - 2;
        ctx.beginPath();
        ctx.arc(mid, mid, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, SIZE, SIZE);
        const maxSize = SIZE * 0.84;
        const scale = Math.min(maxSize / image.naturalWidth, maxSize / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        ctx.drawImage(image, (SIZE - width) / 2, (SIZE - height) / 2, width, height);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Unable to process logo.'));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read this image. Please try another file.'));
    };
    image.src = objectUrl;
  });
}
