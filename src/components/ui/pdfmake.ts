// utils/pdfmake.ts

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// ✅ Safely cast to `unknown` first, then to typed structure
(pdfMake as typeof pdfMake).vfs = (pdfFonts as unknown as { pdfMake: { vfs: typeof pdfMake.vfs } }).pdfMake.vfs;

export default pdfMake;
