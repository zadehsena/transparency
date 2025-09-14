export type BusinessUnit = {
  name: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  medianResponseDays: number;
};

type BUStat = {
  name: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  medianResponseDays: number | null; // <- allow null
};

export default function CompanyStats({ businessUnits }: { businessUnits: BUStat[] }) {
  return (
    <div>
      {/* ... */}
      {businessUnits.map((bu) => (
        <div key={bu.name} className="...">
          {/* other fields */}
          <div className="text-xs text-gray-500">
            Median response days: {bu.medianResponseDays ?? '—'}
          </div>
        </div>
      ))}
    </div>
  );
}