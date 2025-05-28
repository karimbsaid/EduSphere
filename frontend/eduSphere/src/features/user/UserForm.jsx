/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../ui/Input";
import DropDown from "../../ui/DropDown";
import Button from "../../ui/Button";
import { deepDiff } from "../../utils/hasChanged";
import { addUser, editUser } from "../../services/apiProfile";
import { useAuth } from "../../context/authContext";
import { getAllRoles } from "../../services/apiRole";
import { useSearchParams } from "react-router-dom";

export default function UserForm({ user = {}, onClose }) {
  const [roles, setRoles] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const { user: authentifiedUser } = useAuth();
  const { token } = authentifiedUser;
  const getRoles = async () => {
    const reponse = await getAllRoles(token);
    setRoles(reponse.data.data);
  };
  useEffect(() => {
    getRoles();
  }, []);
  const { _id, ...other } = user;
  const isEdit = !!_id;

  const { register, handleSubmit, setValue, watch, formState } = useForm({
    defaultValues: isEdit
      ? {
          ...user,
          status: user.status ?? "active",
          blockReason: user.blockReason ?? "",
        }
      : {
          role: "Admin",
          name: "",
          email: "",
          password: "changeme",
          permissions: [],
          status: "active",
          blockReason: "",
        },
  });

  const { errors } = formState;
  // const selectedPermissions = watch("permissions");
  // const handlePermissionChange = (permission) => {
  //   const current = selectedPermissions || [];
  //   if (current.includes(permission)) {
  //     setValue(
  //       "permissions",
  //       current.filter((p) => p !== permission)
  //     );
  //   } else {
  //     setValue("permissions", [...current, permission]);
  //   }
  // };

  const onFormSubmit = async (data) => {
    console.log("on form submit");
    if (isEdit) {
      // const changedFields = deepDiff(other, data);
      try {
        const updatedUser = await editUser(token, { _id, ...data });
        console.log(updatedUser);
      } catch (err) {
        console.error("Erreur de mise à jour :", err);
      }
    } else {
      try {
        const newUser = await addUser(token, data);
        console.log("Utilisateur mis à jour:", newUser);
      } catch (err) {
        console.error("Erreur de mise à jour :", err);
      }
    }
    searchParams.set("page", 1);
    setSearchParams(searchParams);

    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <h2 className="text-2xl font-bold mb-4">
        {isEdit ? "Modifier Utilisateur" : "Créer Utilisateur"}
      </h2>

      <Input
        label="Nom d'utilisateur"
        placeholder="Entrer le nom"
        {...register("name", { required: true })}
      />
      {errors.name && (
        <p className="text-red-600 text-sm">Ce champ est requis</p>
      )}

      {!isEdit && (
        <>
          <Input
            label="Email"
            type="email"
            placeholder="Entrer l'email"
            {...register("email", { required: true })}
          />
          {errors.email && <p className="text-red-600 text-sm">Email requis</p>}
        </>
      )}

      {!isEdit && (
        <>
          <Input
            label="Mot de passe"
            type="password"
            placeholder="Changer le mot de passe"
            {...register("password", { required: true })}
          />
          {errors.password && (
            <p className="text-red-600 text-sm">Mot de passe requis</p>
          )}
        </>
      )}

      <div>
        <label className="block text-gray-700 font-medium mb-1">Rôle</label>
        <DropDown
          value={watch("role")}
          onValueChange={(val) => setValue("role", val)}
        >
          <DropDown.Button showSelectedValue label="Choisir un rôle" />
          <DropDown.Content>
            {roles.map((role) => (
              <DropDown.Item key={role._id} value={role._id}>
                {role.name}
              </DropDown.Item>
            ))}
          </DropDown.Content>
        </DropDown>
      </div>

      <div className="flex justify-between mt-5">
        <Button
          label="annuler"
          className="bg-blue-600 text-white"
          onClick={onClose}
        />
        <Button
          type="submit"
          label={isEdit ? "Mettre à jour" : "Créer"}
          className="bg-blue-600 text-white"
        />
      </div>
    </form>
  );
}
