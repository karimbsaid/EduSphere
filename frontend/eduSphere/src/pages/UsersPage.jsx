import React, { useEffect, useRef, useState } from "react";
import { getAllUsers } from "../services/apiProfile";
import { useAuth } from "../context/authContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import Card from "../ui/Card";
import Table from "../ui/Table";
import UserRow from "../features/user/UserRow";
import Pagination from "../components/Pagination";
import Spinner from "../ui/Spinner";
import UserTableOperation from "../features/user/UserTableOperation";
export default function Users() {
  const { user } = useAuth();
  const token = user.token;
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || 1, 10);
  const limit = parseInt(searchParams.get("limit") || 5, 10);
  const role = searchParams.get("role") || "all";
  const search = searchParams.get("search") || "";

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const query = {
        page: currentPage,
        limit,
      };
      if (search.trim() != "") query.search = search;
      if (role != "all") query.role = role;
      const data = await getAllUsers(token, query);
      setTotalUsers(data.totalDocuments);
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [currentPage, limit, token, searchParams, search, role]);
  const totalPages = Math.ceil(totalUsers / limit);

  const handleChangePage = (page) => {
    setSearchParams({ page, limit });
  };

  // const handleDeleteUser = (userId) => {
  //   setUsers((prev) => {
  //     prev.filter((user) => user._id != userId);
  //   });
  // };

  // const handleDeleteUser = (userId) => {
  //   setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
  // };

  const handleAddUser = (newUser) => {
    console.log("new user", newUser);
    setTotalUsers((prev) => prev + 1);

    if (currentPage === 1) {
      setUsers((prevUsers) => {
        const updatedUsers = [newUser, ...prevUsers];
        return updatedUsers.slice(0, limit);
      });
    } else {
      handleChangePage(1);
    }
  };
  const handleUpdateUser = (updateUser) => {
    setUsers((prevUser) =>
      prevUser.map((user) => (user._id === updateUser._id ? updateUser : user))
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner size="lg" />
        <div className="ml-4 text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <Card className="space-y-4">
        <UserTableOperation handleAddUser={handleAddUser} />

        <div className="rounded-md border">
          <Table>
            <Table.Header>
              <Table.Head>Utilisateur</Table.Head>
              <Table.Head>Rôle</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Date d&apos;inscription</Table.Head>
              {/* <Table.Head>Numéro télephone</Table.Head> */}
              <Table.Head className="text-right">Actions</Table.Head>
            </Table.Header>
            <Table.Body
              data={users}
              render={(user) => (
                <UserRow
                  user={user}
                  key={user._id}
                  UpdateUser={handleUpdateUser}
                  onRefetch={fetchUsers}
                />
              )}
            />
            <Table.Footer>
              <Pagination
                currentPage={currentPage}
                totalCount={totalUsers}
                totalPages={totalPages}
                perPage={limit}
                onPageChange={handleChangePage}
              />
            </Table.Footer>
          </Table>
        </div>
      </Card>
    </div>
  );
}
