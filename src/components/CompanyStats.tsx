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

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
    {children}
  </th>
);
const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-3 align-top text-sm">{children}</td>
);

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