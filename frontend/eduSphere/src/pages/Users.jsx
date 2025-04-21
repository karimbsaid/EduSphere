import React, { useEffect, useRef, useState } from "react";
import { getAllUsers } from "../services/apiProfile";
import { useAuth } from "../context/authContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import Modal from "../ui/ModalOff";
import Card from "../ui/Card";
import Table from "../ui/TableOff";
import UserRow from "../features/user/UserRow";
import { FaSearch } from "react-icons/fa";
import Input from "../ui/Input";
import Button from "../ui/Button";
import UserForm from "../features/admin/UserForm";
import Badge from "../ui/Badge";
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
  useEffect(() => {
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
    fetchUsers();
  }, [currentPage, limit, token, searchParams, search, role]);
  const totalPages = Math.ceil(totalUsers / limit);

  const handleChangePage = (page) => {
    setSearchParams({ page, limit });
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
        <UserTableOperation />

        <div className="rounded-md border">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Utilisateur</Table.Head>
                <Table.Head>Rôle</Table.Head>
                <Table.Head>Date d&apos;inscription</Table.Head>
                <Table.Head className="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body
              data={users}
              render={(user) => <UserRow user={user} key={user._id} />}
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
