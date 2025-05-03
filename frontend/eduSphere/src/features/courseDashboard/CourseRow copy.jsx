/* eslint-disable react/prop-types */
import React from "react";
import Table from "../../ui/TableOff";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import Modal from "../../ui/ModalOff";
import ConfirmDelete from "../../components/ConfirmDelete";

export default function CourseRow({ course }) {
  const badgeVariant = {
    published: "success",
    draft: "warning",
    pending: "secondary",
  };

  const badgeCategoryVariant = {
    PROGRAMMING: "success",
    MARKETING: "warning",
    pending: "secondary",
  };
  return (
    <>
      <Table.Row key={course._id}>
        <Table.Cell>{course.title}</Table.Cell>
        <Table.Cell>{course.instructor?.name}</Table.Cell>
        <Table.Cell>
          <Badge
            variant={badgeCategoryVariant[course.category]}
            text={course.category}
          />
        </Table.Cell>
        <Table.Cell>{course.price}</Table.Cell>
        <Table.Cell>
          <Badge variant={badgeVariant[course.status]} text={course.status} />
        </Table.Cell>
        <Table.Cell className="text-right">
          <div className="flex gap-5">
            <Button label="Voir" outline />
            <Button label="Éditer" />
            <Modal>
              <Modal.Open opens="deleteUser">
                <Button
                  variant="ghost"
                  label="supprimer"
                  size="sm"
                  className="text-red-500"
                />
              </Modal.Open>

              <Modal.Window name="deleteUser">
                <ConfirmDelete
                  user={course}
                  confirmationText={`je suis sure de supprimer l'utilisateur ${course.title}`}
                  onConfirm={() => console.log("delete course")}
                />
              </Modal.Window>
            </Modal>
          </div>
        </Table.Cell>
      </Table.Row>
    </>
  );
}
