/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function ConfirmDelete({
  confirmationText = "",
  onConfirm,
  onClose,
}) {
  const [inputValue, setInputValue] = useState("");

  const isValid =
    inputValue.trim().toLowerCase() === confirmationText.toLowerCase();

  return (
    <div className="p-4 flex flex-col gap-5 ">
      <p className="text-sm text-gray-700">
        Pour confirmer la suppression veuillez saisir exactement :
        <br />
        <code className="text-red-600 font-semibold">{confirmationText}</code>
      </p>

      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Tapez la phrase exacte ici..."
        className="w-full border border-gray-300 rounded px-3 py-2"
      />

      <div className="flex justify-between gap-3">
        <Button label="Annuler" variant="ghost" onClick={onClose} />
        <Button
          label="Confirmer la suppression"
          variant="warning"
          disabled={!isValid}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
