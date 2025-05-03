/* eslint-disable react/prop-types */
import React from "react";
import Table from "../../ui/TableOff";
import { formatDate } from "../../utils/formatDate";
import Badge from "../../ui/Badge";

export default function PaimentRow({ payment }) {
  console.log("payment", payment);
  const badgeVariant = {
    published: "success",
    draft: "warning",
    pending: "secondary",
  };

  return (
    <>
      <Table.Row>
        <Table.Cell>{payment.paymentId}</Table.Cell>
        <Table.Cell>{payment.studentId.name}</Table.Cell>
        <Table.Cell>{payment.courseId.title}</Table.Cell>
        <Table.Cell>{formatDate(payment.createdAt) || "today"}</Table.Cell>
        <Table.Cell>{payment.amount}</Table.Cell>
        <Table.Cell>
          <Badge
            variant={badgeVariant[payment.paymentStatus]}
            text={payment.paymentStatus}
          />
        </Table.Cell>
      </Table.Row>
    </>
  );
}
