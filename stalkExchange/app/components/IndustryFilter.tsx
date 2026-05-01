const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Consumer Discretionary',
  'Automotive', 'Energy', 'Real Estate', 'Utilities',
  'Industrials', 'Materials', 'Communication Services', 'Other',
];

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function IndustryFilter({ value, onChange }: Props) {
  return (
    <div className="industry-filter">
      <label className="industry-filter-label">FILTER BY INDUSTRY</label>
      <select
        className="industry-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All Industries</option>
        {INDUSTRIES.map((ind) => (
          <option key={ind} value={ind}>{ind}</option>
        ))}
      </select>
    </div>
  );
}
