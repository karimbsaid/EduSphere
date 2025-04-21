/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Button from "../ui/Button";

export default function RejetCourForm({ id, onConfirm, onClose }) {
  const [raisonRejet, setRaisonRejet] = useState("");

  return (
    <div className="p-4 flex flex-col gap-5 ">
      <p className="text-sm text-gray-700">Saisir raison de rejet :</p>

      <textarea
        id="rejet"
        value={raisonRejet}
        onChange={(e) => setRaisonRejet(e.target.value)}
        placeholder="Enter raison de rejet"
        rows={4}
        className="mt-1 w-full rounded border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black"
      />

      <div className="flex justify-between gap-3">
        <Button label="Annuler" variant="ghost" onClick={onClose} />
        <Button
          label="Confirmer "
          variant="warning"
          onClick={() => {
            onConfirm(id, raisonRejet, "pending");
            onClose();
          }}
        />
      </div>
    </div>
  );
}
