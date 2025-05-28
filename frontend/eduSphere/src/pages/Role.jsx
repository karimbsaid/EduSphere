import React, { useEffect, useState } from "react";
import Card from "../ui/Card";
import Table from "../ui/Table";
import { getAllFeatures, getAllRoles } from "../services/apiRole";
import RoleRow from "../features/Role/RoleRow";
import RoleTableOperation from "../features/Role/RoleTableOperation";
import { useAuth } from "../context/authContext";

export default function Role() {
  const [roles, setRoles] = useState([]);
  const [features, setFeatures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const token = user.token;

  const handleAddRole = (newRole) => {
    setRoles((prevRoles) => [...prevRoles, newRole]);
  };
  const handleUpdateRole = (updateRole) => {
    setRoles((prevRole) =>
      prevRole.map((role) => (role._id === updateRole._id ? updateRole : role))
    );
  };

  const handleDeleteRole = (roleId) => {
    setRoles((prevRoles) => prevRoles.filter((role) => role._id !== roleId));
  };

  useEffect(() => {
    const getRoles = async () => {
      const reponse = await getAllRoles(token);
      setRoles(reponse.data.data);
    };
    const getFeatures = async () => {
      const reponse = await getAllFeatures(token);
      setFeatures(reponse.data.data);
    };

    getRoles();
    getFeatures();
  }, []);

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <RoleTableOperation
        handleAddRole={handleAddRole}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <Table>
        <Table.Header>
          <Table.Head>Role</Table.Head>
          <Table.Head>Created</Table.Head>
          <Table.Head>Actions</Table.Head>
        </Table.Header>
        <Table.Body
          data={filteredRoles}
          render={(role) => (
            <RoleRow
              handleDeleteRole={handleDeleteRole}
              handleupdateRole={handleUpdateRole}
              features={features}
              role={role}
              key={role._id}
            />
          )}
        />
        <Table.Footer></Table.Footer>
      </Table>
    </Card>
  );
}
