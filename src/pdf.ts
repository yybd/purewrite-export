import type { PrintPage } from '../vendor/purewrite/src/services/export/engine';
// paged.js's own source, as text (esbuild.config.mjs) — the version the app ships.
import pagedJs from 'pagedjs-standalone?raw';

/**
 * A PDF on the desktop: the engine's print page (the one PureWrite draws with
 * the Mac's WebKit) opened in a hidden Chromium window, laid out by paged.js,
 * and printed by Chromium's own printToPDF — one PDF page per paged.js page,
 * on the template's paper. Nothing leaves the device: the window
 * loads no URL, only the page written into it.
 *
 * Electron exists only in the desktop app, so it is looked up when a PDF is
 * made, never at load: the plugin still loads on a phone, where PDF is simply
 * not offered (pdfAvailable).
 */

interface PrintToPdfOptions {
    pageSize: { width: number; height: number };
    scale: number;
    preferCSSPageSize: boolean;
    printBackground: boolean;
    margins: { marginType: 'none' };
}
interface HiddenWindow {
    loadURL(url: string): Promise<void>;
    destroy(): void;
    webContents: {
        executeJavaScript(code: string): Promise<unknown>;
        printToPDF(options: PrintToPdfOptions): Promise<Uint8Array>;
    };
}
type WindowConstructor = new (options: object) => HiddenWindow;

const LAYOUT_TIMEOUT = 180_000;

function browserWindow(): WindowConstructor | null {
    try {
        const load = (window as unknown as { require?: (id: string) => unknown }).require;
        const electron = load?.('electron') as { remote?: { BrowserWindow?: WindowConstructor } } | undefined;
        return electron?.remote?.BrowserWindow ?? null;
    } catch {
        return null;
    }
}

export const pdfAvailable = () => browserWindow() !== null;

export { pagedJs };

export async function renderPdf(page: PrintPage, onProgress: (pages: number) => void): Promise<Uint8Array> {
    const BrowserWindow = browserWindow();
    if (!BrowserWindow) throw new Error('PDF export needs Obsidian on a computer.');
    // The page's CSS px are points (see printToPDF below): one px per point.
    const px = (pt: number) => Math.ceil(pt);
    const win = new BrowserWindow({
        show: false,
        width: px(page.width),
        height: px(page.height),
        webPreferences: { backgroundThrottling: false, contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    try {
        await win.loadURL('about:blank');
        await win.webContents.executeJavaScript(
            `document.open(); document.write(${JSON.stringify(page.html)}); document.close(); 0`,
        );
        const deadline = Date.now() + LAYOUT_TIMEOUT;
        for (;;) {
            const [count, error, sofar] = (await win.webContents.executeJavaScript(
                "[window.__pwPageCount || 0, window.__pwError || '', document.querySelectorAll('.pagedjs_page').length]",
            )) as [number, string, number];
            if (error) throw new Error(error.split('\n')[0]);
            if (count) break;
            if (Date.now() > deadline) throw new Error('Laying out the pages took too long.');
            onProgress(sofar);
            await new Promise((resolve) => window.setTimeout(resolve, 150));
        }
        // The page is written for WebKit, which draws one CSS px as one PDF
        // point (html.ts); Chromium draws a px as 3/4 of a point. So the
        // paper is set here, in inches, and the page is scaled up by 96/72 —
        // each 595px paged.js page fills one 595pt sheet, as in the app.
        const data = await win.webContents.printToPDF({
            pageSize: { width: page.width / 72, height: page.height / 72 },
            scale: 96 / 72,
            preferCSSPageSize: false,
            printBackground: true,
            margins: { marginType: 'none' },
        });
        return new Uint8Array(data);
    } finally {
        win.destroy();
    }
}
