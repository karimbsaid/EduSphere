/* eslint-disable react/prop-types */
import React from "react";
import Table from "../../ui/TableOff";
import { formatDate } from "../../utils/formatDate";
import Badge from "../../ui/Badge";

export default function StudentRow({ student }) {
  const badgeVariant = {
    0: "ghost",
    50: "warning",
    100: "success",
  };

  return (
    <>
      <Table.Row>
        <Table.Cell>{student.studentId.name}</Table.Cell>
        <Table.Cell>{student.studentId.email}</Table.Cell>
        <Table.Cell>{student.courseId.title}</Table.Cell>
        <Table.Cell>{formatDate(student.enrolledAt) || "today"}</Table.Cell>
        <Table.Cell>
          <Badge
            variant={badgeVariant[student?.progress.progressPercentage]}
            text={student?.progress.progressPercentage}
          />
        </Table.Cell>
        <Table.Cell>
          <Badge variant="primary" text={student.paymentStatus} />
        </Table.Cell>
      </Table.Row>
    </>
  );
}
