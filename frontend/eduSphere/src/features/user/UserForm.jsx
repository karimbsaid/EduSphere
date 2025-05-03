/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../../ui/Input";
import DropDown from "../../ui/DropDownn";
import Button from "../../ui/Button";
import { deepDiff } from "../../utils/hasChanged";
import { addUser, editUser } from "../../services/apiProfile";
import { useAuth } from "../../context/authContext";
const roles = [
  { value: "admin", label: "Admin" },
  { value: "instructor", label: "Instructor" },
  { value: "student", label: "Student" },
];

// const permissionsList = [
//   "createCourse",
//   "editCourse",
//   "deleteCourse",
//   "addUser",
//   "editUser",
//   "deleteUser",
//   "enrollCourse",
// ];

export default function UserForm({ user = {}, onClose }) {
  const { user: authentifiedUser } = useAuth();
  const { token } = authentifiedUser;
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
          role: "admin",
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
    if (isEdit) {
      const changedFields = deepDiff(other, data);
      try {
        const updatedUser = await editUser(token, { _id, ...changedFields });
        console.log(updatedUser);
        console.log("Utilisateur mis à jour:", updatedUser);
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
          <DropDown.Button label="Choisir un rôle" />
          <DropDown.Content>
            {roles.map((role) => (
              <DropDown.Item key={role.value} value={role.value}>
                {role.label}
              </DropDown.Item>
            ))}
          </DropDown.Content>
        </DropDown>
      </div>
      {isEdit && (
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="form-checkbox text-red-600"
              {...register("status")}
              onChange={(e) =>
                setValue("status", e.target.checked ? "blocked" : "active")
              }
              checked={watch("status") === "blocked"}
            />
            <span className="text-red-600 font-medium">
              Bloquer cet utilisateur
            </span>
          </label>

          {watch("status") === "blocked" && (
            <div className="mt-2">
              <Input
                label="Raison du blocage"
                placeholder="Indiquer la raison du blocage"
                {...register("blockReason", {
                  required: watch("status") === "blocked",
                })}
              />
              {errors.blockReason && (
                <p className="text-red-600 text-sm">
                  Ce champ est requis si l'utilisateur est bloqué
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* <div>
        <label className="block text-gray-700 font-medium mb-1">
          Permissions
        </label>
        <div className="flex flex-wrap gap-3">
          {permissionsList.map((perm) => (
            <label key={perm} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPermissions?.includes(perm)}
                onChange={() => handlePermissionChange(perm)}
                className="form-checkbox text-blue-600"
              />

              <span className="capitalize">{perm}</span>
            </label>
          ))}
        </div>
      </div> */}

      <div className="flex justify-between mt-5">
        <Button
          label="annuler"
          className="bg-blue-600 text-white"
          onClick={onClose}
        />
        <Button
          label={isEdit ? "Mettre à jour" : "Créer"}
          className="bg-blue-600 text-white"
        />
      </div>
    </form>
  );
}
