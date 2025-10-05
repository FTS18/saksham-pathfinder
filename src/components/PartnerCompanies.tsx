

const companies = [
  'Infosys', 'HDFC Bank', 'Maruti Suzuki India', 'Hindustan Unilever (HUL)', 'Larsen & Toubro',
  'Apollo Hospitals', 'Reliance Jio', 'PwC', 'BHEL', 'Wipro', 'ITC Hotels', 'DLF Limited',
  'Flipkart', 'ICICI Bank', 'ONGC', 'Zomato', 'Kotak Mahindra Bank', 'Mahindra & Mahindra',
  'Reliance Retail', 'Godrej Properties'
];

export const PartnerCompanies = () => {
  return (
    <div className="py-8 border-t border-border">
      <h2 className="text-4xl font-racing font-bold text-center mb-8">Our Partners</h2>
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {companies.concat(companies).map((company, idx) => (
            <a
              key={idx}
              href={`/company/${company.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and').replace(/\(|\)/g, '')}`}
              className="inline-flex items-center justify-center px-6 py-3 mx-2 bg-muted/50 hover:bg-muted rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {company}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
