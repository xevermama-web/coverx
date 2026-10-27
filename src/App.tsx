import { useEffect, useRef, useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { InputForm } from './components/InputForm';
import { CoverPageTemplate } from './components/CoverPageTemplate';
import { ArrowDownToLine, CheckCircle2, FileText, LoaderCircle, Moon, PanelLeft, Printer, Sun, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
type Pane = 'editor' | 'preview';
type Toast = { text: string; type: 'success' | 'error' } | null;

function Workspace() {
  const { data, logoSrc, logoReady, detailsSaved, theme, toggleTheme } = useAppContext();
  const previewWidthRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.7);
  const [activePane, setActivePane] = useState<Pane>('editor');
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = previewWidthRef.current;
    if (!element) return;
    const measure = () => {
      const width = element.clientWidth;
      if (width) setPreviewScale(Math.min(1, Math.max(.14, (width - 48) / PAGE_WIDTH)));
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [activePane]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const checkRequiredFields = () => {
    if (data.courseTitle.trim()) return true;
    setToast({ text: 'Please enter a course title before exporting.', type: 'error' });
    setActivePane('editor');
    return false;
  };

  const exportPDF = async () => {
    if (isExporting || !logoReady || !pdfRef.current || !checkRequiredFields()) return;
    setIsExporting(true);
    try {
      await document.fonts.ready;
      const img = pdfRef.current.querySelector('img');
      if (img && !img.complete) {
        await Promise.race([
          new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
          new Promise<void>((resolve) => window.setTimeout(resolve, 4000))
        ]);
      }
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: false,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: PAGE_WIDTH,
        windowHeight: PAGE_HEIGHT,
        onclone: (cloneDocument) => {
          const stage = cloneDocument.querySelector<HTMLElement>('.print-stage');
          if (stage) {
            stage.style.position = 'fixed';
            stage.style.left = '0';
            stage.style.top = '0';
            stage.style.zIndex = '9999';
            stage.style.visibility = 'visible';
            stage.style.transform = 'none';
          }
        }
      });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, 210, 297);
      const code = data.courseCode.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'Cover_Page';
      pdf.save(`CoverXPro_${code}.pdf`);
      setToast({ text: 'A4 cover page downloaded.', type: 'success' });
    } catch (error) {
      console.error('PDF generation failed', error);
      setToast({ text: 'Could not generate the PDF. Please try again.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const printPage = () => {
    if (logoReady && checkRequiredFields()) window.print();
  };

  const downloadAction = (additionalClass = '') => (
    <button type="button" className={`primary-action ${additionalClass}`} onClick={exportPDF} disabled={isExporting || !logoReady}>
      {isExporting ? <LoaderCircle className="animate-spin" size={18} /> : <ArrowDownToLine size={18} />}
      <span>{isExporting ? 'Preparing PDF…' : 'Download PDF'}</span>
    </button>
  );

  return (
    <div className="app-shell">
      <header className="app-header no-print">
        <div className="app-header-inner">
          <div className="brand-wrap">
            <div className="brand-mark" aria-hidden="true"><FileText size={22} strokeWidth={2.1} /></div>
            <div className="brand-text"><div className="brand-name">CoverX <span>Pro</span></div><span className="brand-subtitle">COVER PAGE STUDIO</span></div>
          </div>
          <div className="header-actions">
            <span className={`autosave-indicator ${!detailsSaved ? 'autosave-warning' : ''}`} title="Details are saved in this browser only">
              <span className="status-dot" />{detailsSaved ? 'Saved on this browser' : 'Browser storage unavailable'}
            </span>
            <button type="button" className="icon-action" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title="Change theme">
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </div>
      </header>

      <main className="workspace-content no-print">
        <div className="mobile-tabs" role="tablist" aria-label="Switch between editor and preview">
          <button type="button" role="tab" aria-selected={activePane === 'editor'} className={`mobile-tab ${activePane === 'editor' ? 'mobile-tab-active' : ''}`} onClick={() => setActivePane('editor')}><PanelLeft size={16} /> Edit details</button>
          <button type="button" role="tab" aria-selected={activePane === 'preview'} className={`mobile-tab ${activePane === 'preview' ? 'mobile-tab-active' : ''}`} onClick={() => setActivePane('preview')}><FileText size={16} /> Preview</button>
        </div>

        <div className="workspace-grid">
          <motion.aside
            className={`workspace-card editor-card ${activePane === 'editor' ? 'pane-visible' : 'pane-hidden'}`}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .32 }}
          >
            <div className="panel-heading"><div className="panel-heading-icon"><PanelLeft size={18} /></div><h2>Document details</h2></div>
            <div className="editor-body"><InputForm /></div>
          </motion.aside>

          <motion.section
            className={`workspace-card preview-card ${activePane === 'preview' ? 'pane-visible' : 'pane-hidden'}`}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .32, delay: .08 }}
          >
            <div className="panel-heading"><div className="panel-heading-icon"><FileText size={18} /></div><h2>Live preview</h2><span className="preview-badge">A4 · PORTRAIT</span></div>
            <div className="preview-stage" ref={previewWidthRef}>
              <div className="paper-space" style={{ width: PAGE_WIDTH * previewScale, height: PAGE_HEIGHT * previewScale }}>
                <div className="paper-preview" style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, transform: `scale(${previewScale})` }}>
                  <CoverPageTemplate data={data} logoSrc={logoSrc} />
                </div>
              </div>
            </div>
            <div className="preview-footer">
              <button type="button" className="secondary-action" onClick={printPage} disabled={!logoReady}><Printer size={17} /> Print</button>
              {downloadAction()}
            </div>
          </motion.section>
        </div>
      </main>

      <div className="mobile-action-bar no-print">
        <button type="button" className="secondary-action" onClick={printPage} disabled={!logoReady}><Printer size={17} /> Print</button>
        {downloadAction('mobile-download')}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div className={`app-toast ${toast.type === 'error' ? 'app-toast-error' : ''}`} role="status"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
            <span>{toast.text}</span>
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={15} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="print-stage" aria-hidden="true">
        <CoverPageTemplate ref={pdfRef} data={data} logoSrc={logoSrc} />
      </div>
    </div>
  );
}

export default function App() {
  return <AppProvider><Workspace /></AppProvider>;
}
