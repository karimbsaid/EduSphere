import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { getAllPayments } from "../services/apiPayment";
import GestionPayment from "../features/admin/GestionPayment";

export default function PaymentsDashboard() {
  const [payments, setPayments] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const token = user?.token;
  const limit = parseInt(searchParams.get("limit") || 5);
  const page = parseInt(searchParams.get("page") || 1);

  const fetchPayments = useCallback(async () => {
    const query = {
      sort: searchParams.get("sort") || "-amount",
      page,
      limit,
    };
    const paymentStatus = searchParams.get("paymentStatus");
    if (paymentStatus && paymentStatus !== "ALL") {
      query.paymentStatus = paymentStatus;
    }
    const search = searchParams.get("search")?.trim();
    if (search && search != "") {
      query.search = search;
    }
    const startDate = searchParams.get("startDate");
    if (startDate) {
      query.startDate = startDate;
    }
    const endDate = searchParams.get("endDate");
    if (endDate) {
      query.endDate = endDate;
    }
    const paymentData = await getAllPayments(query, token);
    console.log(paymentData);
    setTotalPayments(paymentData.totalDocuments);
    setPayments(paymentData.paiements);
  }, [searchParams, page, limit, token]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  return (
    <div>
      <GestionPayment
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        totalPayments={totalPayments}
        currentPage={page}
        payment={payments}
        limit={limit}
      />
    </div>
  );
}
