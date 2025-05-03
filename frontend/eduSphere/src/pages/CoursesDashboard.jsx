import React, { useEffect, useState, useCallback } from "react";
import { getAllcourse } from "../services/apiCourse";
import { useAuth } from "../context/authContext";
import { useSearchParams } from "react-router-dom";
import CourseTableOperation from "../features/courseDashboard/CourseTableOperation";
import Card from "../ui/Card";
import Table from "../ui/TableOff";
import CourseRow from "../features/courseDashboard/CourseRow";
import Pagination from "../components/Pagination";
import Spinner from "../ui/Spinner";
import { Modal } from "../ui/ModalOff";

export default function CoursesDashboard() {
  const { user } = useAuth();
  const token = user?.token;
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || 1, 10);
  const limit = parseInt(searchParams.get("limit") || 5, 10);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "totalStudents";
  const status = searchParams.get("status") || "tous";
  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const query = {
          sort,
          page: currentPage,
          limit,
        };
        if (search.trim() != "") query.search = search;
        if (status != "tous") query.status = status;
        const courseData = await getAllcourse(query, token);
        setTotalCourses(courseData.totalDocuments);
        setCourses(courseData.courses);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [currentPage, limit, token, searchParams, search, sort, status]);
  const totalPages = Math.ceil(totalCourses / limit);

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
        <CourseTableOperation />

        <div className="rounded-md border">
          <Modal>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Cours</Table.Head>
                  <Table.Head>Instructeur</Table.Head>
                  <Table.Head>Catégorie</Table.Head>
                  <Table.Head>Prix</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body
                data={courses}
                render={(course) => (
                  <CourseRow course={course} key={course._id} />
                )}
              />
              <Table.Footer>
                <Pagination
                  currentPage={currentPage}
                  totalCount={totalCourses}
                  totalPages={totalPages}
                  perPage={limit}
                  onPageChange={handleChangePage}
                />
              </Table.Footer>
            </Table>
          </Modal>
        </div>
      </Card>
    </div>
  );
}
