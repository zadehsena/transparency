export type BusinessUnit = {
  name: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  medianResponseDays: number;
};

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
    {children}
  </th>
);
const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-3 align-top text-sm">{children}</td>
);

export default function CompanyStats({ businessUnits }: { businessUnits: BusinessUnit[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <Th>Business Unit</Th>
            <Th>Applications</Th>
            <Th>Response Rate</Th>
            <Th>Interviews</Th>
            <Th>Offers</Th>
            <Th>Median Response</Th>
          </tr>
        </thead>
        <tbody>
          {businessUnits.map((u, i) => {
            const rr = u.applications ? Math.round((u.responses / u.applications) * 100) : 0;
            return (
              <tr key={u.name} className={i % 2 ? "bg-white" : "bg-gray-50/50"}>
                <Td className="font-medium">{u.name}</Td>
                <Td>{u.applications.toLocaleString()}</Td>
                <Td>{rr}%</Td>
                <Td>{u.interviews.toLocaleString()}</Td>
                <Td>{u.offers.toLocaleString()}</Td>
                <Td>{u.medianResponseDays} days</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
