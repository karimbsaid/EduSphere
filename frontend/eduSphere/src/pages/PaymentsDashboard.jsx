import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { getAllPayments } from "../services/apiPayment";
import Spinner from "../ui/Spinner";
import Card from "../ui/Card";
import PaimentTableOperation from "../features/paiments/PaimentTableOperation";
import Table from "../ui/Table";
import PaimentRow from "../features/paiments/PaimentRow";
import Pagination from "../components/Pagination";
export default function PaymentsDashboard() {
  const [payments, setPayments] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const token = user?.token;
  const limit = parseInt(searchParams.get("limit") || 5);
  const currentPage = parseInt(searchParams.get("page") || 1, 10);
  const sort = searchParams.get("sort") || "-createdAt";
  const status = searchParams.get("paymentStatus") || "All";
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
          "updatedAt[gte]": startDate,
          "updatedAt[lte]": endDate,
        };
        if (search.trim() != "") query.search = search;
        if (status != "All") query.paymentStatus = status;
        const paymentData = await getAllPayments(query, token);
        setTotalPayments(paymentData.totalDocuments);
        setPayments(paymentData.paiements);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, [limit, currentPage, search, sort, status, token, searchParams]);
  const totalPages = Math.ceil(totalPayments / limit);

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
        <PaimentTableOperation />

        <div className="rounded-md border">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>ID Transaction</Table.Head>
                <Table.Head>Utilisateur</Table.Head>
                <Table.Head>Cours</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Montant</Table.Head>
                <Table.Head>Status</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body
              data={payments}
              render={(payment) => (
                <PaimentRow payment={payment} key={payment._id} />
              )}
            />
            <Table.Footer>
              <Pagination
                currentPage={currentPage}
                totalCount={totalPayments}
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
