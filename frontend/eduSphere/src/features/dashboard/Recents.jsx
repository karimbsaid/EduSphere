import React from "react";
import Table from "../../ui/Table";
import { formatDate } from "../../utils/formatDate";
import Card from "../../ui/Card";
export default function RecentTable({ data, labels = [], name = "" }) {
  return (
    <Card>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{name}</h3>
      </div>

      <Table>
        <Table.Header>
          {labels.map((lab) => (
            <Table.Head key={lab.label}>{lab.label}</Table.Head>
          ))}
        </Table.Header>
        <Table.Body
          data={data}
          render={(data) => (
            <RecentRow data={data} labels={labels} key={data._id} />
          )}
        />
      </Table>
    </Card>
  );
}

const RecentRow = ({ data, labels }) => {
  return (
    <>
      <Table.Row>
        {labels.map((lab) => (
          <Table.Cell
            key={lab.value}
            className="text-sm max-w-[200px] truncate"
          >
            {lab.value.slice(-2).toLowerCase() === "at"
              ? formatDate(data[lab.value])
              : data[lab.value]}
          </Table.Cell>
        ))}
      </Table.Row>
    </>
  );
};
