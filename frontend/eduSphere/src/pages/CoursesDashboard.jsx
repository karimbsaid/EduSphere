import { getManagedCours } from "../services/apiCourse";
import { useAuth } from "../context/authContext";
import { useSearchParams } from "react-router-dom";
import CourseTableOperation from "../features/courseDashboard/CourseTableOperation";
import Card from "../ui/Card";
import Table from "../ui/Table";
import CourseRow from "../features/courseDashboard/CourseRow";
import Pagination from "../components/Pagination";
import { Modal } from "../ui/Modal";
import { useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import { useEffect } from "react";

const fetchCourses = async ({ queryKey }) => {
  const [_key, { page, limit, sort, search, status, token }] = queryKey;
  const query = { page, limit, sort };
  if (search) query.search = search;
  if (status !== "tous") query.status = status;
  const course = await getManagedCours(query, token);
  return course;
};

export default function CoursesDashboard() {
  const { user } = useAuth();
  const token = user?.token;
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || 1, 10);
  const limit = parseInt(searchParams.get("limit") || 3, 10);
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "totalStudents";
  const status = searchParams.get("status") || "tous";
  useEffect(() => {
    setSearchParams({});
  }, []);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      "courses",
      { page: currentPage, limit, sort, search, status, token },
    ],
    queryFn: fetchCourses,
    keepPreviousData: true,
  });
  const courses = data?.data?.data || [];
  const totalCourses = data?.total || 0;
  const totalPages = Math.ceil(totalCourses / limit);

  const handleChangePage = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page);
    newParams.set("limit", limit);
    setSearchParams(newParams);
  };

  if (isLoading) {
    return <Loading />;
  }
  if (isFetching) {
    return <Loading />;
  }

  return (
    <div>
      <Card className="space-y-4">
        <CourseTableOperation />

        <div className="rounded-md border">
          <Modal>
            <Table>
              <Table.Header>
                <Table.Head>Cours</Table.Head>
                <Table.Head>Instructeur</Table.Head>
                <Table.Head>Catégorie</Table.Head>
                <Table.Head>Prix</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Actions</Table.Head>
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
