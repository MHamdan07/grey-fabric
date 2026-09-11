import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-dark-border bg-dark-card">
      <table className={`w-full text-left text-sm text-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children }) => (
  <thead className="bg-[#14151A] text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-dark-border">
    {children}
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-[#22242D]">{children}</tbody>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`hover:bg-[#1E2028] transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th scope="col" className={`py-3.5 px-4 font-medium ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`py-3 px-4 text-sm ${className}`}>{children}</td>
);
