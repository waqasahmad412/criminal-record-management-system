import { CriminalRecord, Case, Arrest, Complaint, Evidence } from '../types';

export const exportToCsv = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printReportDocument = (
  title: string,
  subtitle: string,
  htmlContent: string,
  verificationMeta?: {
    sealText?: string;
    sealReference?: string;
    officerSignature?: string;
    signatureDateBadge?: string;
  }
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const rawSeal = verificationMeta?.sealText || 'OFFICIAL CRMS SEAL\nDIGITALLY SIGNED & VERIFIED';
  const sealHtml = rawSeal.replace(/\n/g, '<br/>');
  const refCode = verificationMeta?.sealReference
    ? (verificationMeta.sealReference.startsWith('REF:') ? verificationMeta.sealReference : `REF: ${verificationMeta.sealReference}`)
    : `REF: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const sigText = verificationMeta?.officerSignature || 'Authorized Officer Signature: __________________________';
  const dateBadgeText = verificationMeta?.signatureDateBadge || 'Date / Badge Number: __________________________';

  const timestamp = new Date().toLocaleString();
  const docHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - CRMS Law Enforcement Official Report</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .badge { background: #e2e8f0; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; text-transform: uppercase; }
          .meta { font-size: 11px; color: #64748b; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; font-size: 12px; }
          th { background: #f1f5f9; text-align: left; padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #334155; }
          td { padding: 8px 10px; border: 1px solid #cbd5e1; }
          tr:nth-child(even) td { background: #f8fafc; }
          .disclaimer { border-top: 1px dashed #94a3b8; padding-top: 10px; margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; }
          .stamp-box { border: 2px dashed #94a3b8; padding: 12px; margin-top: 20px; width: 240px; font-size: 11px; text-align: center; color: #475569; font-weight: 600; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <span class="badge">Official Law Enforcement Record</span>
            <div class="title">${title}</div>
            <div class="subtitle">${subtitle}</div>
          </div>
          <div class="meta">
            <div>CRMS JURISDICTION: METRO-DIST-04</div>
            <div>Generated: ${timestamp}</div>
            <div>Classification: RESTRICTED LAW ENFORCEMENT</div>
          </div>
        </div>

        <div>${htmlContent}</div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px;">
          <div class="stamp-box">
            ${sealHtml}<br/>
            ${refCode}
          </div>
          <div style="text-align: right; font-size: 11px; color: #475569; line-height: 1.8;">
            <div>${sigText.includes(':') ? sigText : `Authorized Officer Signature: ${sigText}`}</div>
            <div style="margin-top: 8px;">${dateBadgeText.includes(':') ? dateBadgeText : `Date / Badge Number: ${dateBadgeText}`}</div>
          </div>
        </div>

        <div class="disclaimer">
          ACADEMIC & PROTOTYPE DEMONSTRATION. All records contained herein are fictional and generated strictly for evaluation purposes.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(docHtml);
  printWindow.document.close();
};
