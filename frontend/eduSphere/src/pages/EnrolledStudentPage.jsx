import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Spinner from "../ui/Spinner";
import Card from "../ui/Card";
import Table from "../ui/Table";
import Pagination from "../components/Pagination";
import { getListOfMyStudents } from "../services/apiEnrollment";
import StudentTableOperation from "../features/students/StudentTableOperation";
import StudentRow from "../features/students/StudentRow";
import Loading from "../components/Loading";
export default function EnrolledStudentPage() {
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const token = user.token;
  const limit = parseInt(searchParams.get("limit") || 5);
  const currentPage = parseInt(searchParams.get("page") || 1, 10);
  const sort = searchParams.get("sort") || "-createdAt";
  const search = searchParams.get("search") || "";

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const startDate =
        searchParams.get("startDate") || firstDayOfMonth.toISOString();
      const endDate = searchParams.get("endDate") || today.toISOString();

      try {
        const query = {
          sort,
          page: currentPage,
          limit,
        };
        if (search.trim() != "") query.search = search;
        const studentData = await getListOfMyStudents(query, token);
        setTotalStudents(studentData.totalDocuments);
        setStudents(studentData.students);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, [limit, currentPage, search, sort, token, searchParams]);
  const totalPages = Math.ceil(totalStudents / limit);

  const handleChangePage = (page) => {
    setSearchParams({ page, limit });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Card className="space-y-4">
        <StudentTableOperation />

        <div className="rounded-md border">
          <Table>
            <Table.Header>
              <Table.Head>Nom étudiant</Table.Head>
              <Table.Head>Email étudiant</Table.Head>
              <Table.Head>Nom de cour</Table.Head>
              <Table.Head>Date inscrit</Table.Head>
              <Table.Head>Progress</Table.Head>
              <Table.Head>Paiment status</Table.Head>
            </Table.Header>
            <Table.Body
              data={students}
              render={(student) => (
                <StudentRow student={student} key={student._id} />
              )}
            />
            <Table.Footer>
              <Pagination
                currentPage={currentPage}
                totalCount={totalStudents}
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
