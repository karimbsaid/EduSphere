import React, { useEffect, useState } from "react";
import GestionUtilisateurs from "../features/admin/GestionUtilisateurs";
import { getAllUsers } from "../services/apiProfile";
import { useAuth } from "../context/authContext";
import { useNavigate, useSearchParams } from "react-router-dom";
export default function Users() {
  const { user } = useAuth();
  const token = user.token;
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || 1, 10);
  const limit = parseInt(searchParams.get("limit") || 5, 10);
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getAllUsers(token, { page: currentPage, limit });
      setTotalUsers(data.totalDocuments);
      setUsers(data.users);
    };
    fetchUsers();
  }, [currentPage, limit, token]);
  const totalPages = Math.ceil(totalUsers / limit);

  const handleChangePage = (page) => {
    if (page > totalPages || page < 1) return;
    setSearchParams({ page, limit });
  };
  return (
    <div>
      <GestionUtilisateurs
        users={users}
        totalUsers={totalUsers}
        totalPages={totalPages}
        onChangePage={handleChangePage}
        currentPage={currentPage}
        limit={limit}
        onSearch={(val) => {
          if (val.trim() != "") {
            setSearchParams({ search: val, page: 1, limit });
          }
        }}
      />
    </div>
  );
}
