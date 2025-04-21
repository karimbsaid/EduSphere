/* eslint-disable react/prop-types */
// Table.js
const Table = ({ children, className = "" }) => {
  return <table className={`w-full table-auto ${className}`}>{children}</table>;
};

const TableHeader = ({ children }) => {
  return <thead className="bg-gray-100">{children}</thead>;
};

const TableBody = ({ children }) => {
  return <tbody>{children}</tbody>;
};

const TableRow = ({ children, className = "" }) => {
  return <tr className={className}>{children}</tr>;
};

const TableHead = ({ children }) => {
  return (
    <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">
      {children}
    </th>
  );
};

const TableCell = ({ children, className = "" }) => {
  return <td className={`py-3 px-6 ${className}`}>{children}</td>;
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
