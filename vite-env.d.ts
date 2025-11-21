/// <reference types="vite/client" />

declare module '*.css';
declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';

declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | [number, number, number, number];
        filename?: string;
        image?: { type: string; quality: number };
        html2canvas?: any;
        jsPDF?: { unit: string; format: string; orientation: string };
        pagebreak?: { mode: string[] | string };
    }

    interface Html2PdfWorker {
        from(element: HTMLElement): Html2PdfWorker;
        set(options: Html2PdfOptions): Html2PdfWorker;
        save(): Promise<void>;
        toPdf(): Html2PdfWorker;
        get(type: string): Html2PdfWorker;
    }

    export default function html2pdf(): Html2PdfWorker;
}
