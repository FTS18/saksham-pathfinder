interface Application {
  id: string;
  internshipTitle: string;
  companyName: string;
  status: string;
  appliedAt: Date | { toDate: () => Date };
  location?: string;
  stipend?: string;
}

export const exportToCSV = (applications: Application[]) => {
  const headers = ["Title", "Company", "Status", "Applied Date", "Location", "Stipend"];
  
  const rows = applications.map(app => {
    const date = app.appliedAt instanceof Date 
      ? app.appliedAt 
      : app.appliedAt.toDate();
    
    return [
      app.internshipTitle,
      app.companyName,
      app.status,
      date.toLocaleDateString(),
      app.location || "N/A",
      app.stipend || "N/A"
    ].map(field => `"${field}"`).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (applications: Application[]) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>My Applications</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-applied { background-color: #dbeafe; color: #1e40af; }
        .status-accepted { background-color: #d1fae5; color: #065f46; }
        .status-rejected { background-color: #fee2e2; color: #991b1b; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>My Internship Applications</h1>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      <button onclick="window.print()">Print / Save as PDF</button>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Status</th>
            <th>Applied Date</th>
            <th>Location</th>
            <th>Stipend</th>
          </tr>
        </thead>
        <tbody>
          ${applications.map(app => {
            const date = app.appliedAt instanceof Date 
              ? app.appliedAt 
              : app.appliedAt.toDate();
            
            return `
              <tr>
                <td>${app.internshipTitle}</td>
                <td>${app.companyName}</td>
                <td><span class="status status-${app.status}">${app.status}</span></td>
                <td>${date.toLocaleDateString()}</td>
                <td>${app.location || "N/A"}</td>
                <td>${app.stipend || "N/A"}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const filterApplicationsByStatus = (
  applications: Application[],
  status: string
): Application[] => {
  if (status === "all") return applications;
  return applications.filter(app => app.status === status);
};

export const filterApplicationsByDateRange = (
  applications: Application[],
  startDate: Date,
  endDate: Date
): Application[] => {
  return applications.filter(app => {
    const date = app.appliedAt instanceof Date 
      ? app.appliedAt 
      : app.appliedAt.toDate();
    return date >= startDate && date <= endDate;
  });
};
