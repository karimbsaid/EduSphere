import Textarea from "../../ui/TextArea";
import Button from "../../ui/Button";
import { useState } from "react";

export default function BlockUser({ selectedUser, blockUser, onClose }) {
  const [blockReason, setBlockReason] = useState("");
  const onBlockUser = () => {
    blockUser();
    onClose();
  };
  return (
    <>
      {selectedUser?.status === "active" ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to block {selectedUser?.name}? They will no
            longer be able to access the system.
          </p>
          <Textarea
            label="Reason for blocking"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Please provide a reason for blocking this user"
            required
          />
        </div>
      ) : (
        <p className="text-gray-600">
          Are you sure you want to unblock {selectedUser?.name}? They will be
          able to access the system again.
        </p>
      )}
      <div className="flex justify-between">
        <Button label="cancel" onClick={onClose} variant="simple" outline />
        <Button label="save" onClick={onBlockUser} variant="simple" />
      </div>
    </>
  );
}
