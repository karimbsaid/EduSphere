/* eslint-disable react/prop-types */
const Table = ({ children }) => {
  return (
    <div className="w-full ">
      <table className="w-full table-auto min-w-max">{children}</table>
    </div>
  );
};

const Header = ({ children }) => {
  return (
    <thead className="bg-gray-100 uppercase font-semibold">{children}</thead>
  );
};

const Body = ({ data, render }) => {
  if (!data.length)
    return (
      <tbody>
        <tr>
          <td colSpan="100%" className="text-center py-4 text-gray-500">
            No data to show at the moment
          </td>
        </tr>
      </tbody>
    );

  return <tbody>{data.map(render)}</tbody>;
};

const Row = ({ children }) => {
  return <tr>{children}</tr>;
};
const Cell = ({ children }) => {
  return <td className="py-3 px-6">{children}</td>;
};
const Footer = ({ children }) => {
  return (
    <tfoot>
      <tr>
        <td colSpan="100%">
          <div className="w-full">{children}</div>
        </td>
      </tr>
    </tfoot>
  );
};

const Head = ({ children }) => {
  return (
    <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">
      {children}
    </th>
  );
};

Table.Row = Row;
Table.Footer = Footer;
Table.Body = Body;
Table.Header = Header;
Table.Cell = Cell;
Table.Head = Head;
export default Table;
