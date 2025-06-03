/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../ui/Input";
import DropDown from "../../ui/DropDown";
import Button from "../../ui/Button";
import { addUser, editUser } from "../../services/apiProfile";
import { useAuth } from "../../context/authContext";
import { getAllRoles } from "../../services/apiRole";
import { useSearchParams } from "react-router-dom";

export default function UserForm({
  user = {},
  onClose,
  handleUpdateUser,
  handleAddUser,
}) {
  const [roles, setRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  console.log("user", user);

  const { register, handleSubmit, setValue, watch, formState } = useForm({
    defaultValues: isEdit
      ? {
          ...user,
          status: user.status ?? "active",
          role: user.role._id,
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

  const onFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEdit) {
        const { user } = await editUser(token, { _id, ...data });
        if (!user) return;
        const matchedRole = roles.find(
          (role) => String(role._id) === String(user.role)
        );
        handleUpdateUser({ ...user, role: matchedRole });
      } else {
        const { user } = await addUser(token, data);
        if (!user) return;

        const matchedRole = roles.find(
          (role) => String(role._id) === String(user.role)
        );

        handleAddUser({
          ...user,
          role: matchedRole,
        });
      }

      onClose();
    } catch (err) {
      console.error("something went wrong");
    } finally {
      setIsSubmitting(false);
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
        <Button label="annuler" variant="simple" outline onClick={onClose} />
        <Button
          type="submit"
          variant="simple"
          label={isEdit ? "Mettre à jour" : "Créer"}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}
