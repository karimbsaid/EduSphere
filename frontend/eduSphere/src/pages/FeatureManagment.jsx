import React, { useEffect, useState } from "react";
import Card from "../ui/Card";
import Table from "../ui/Table";
import FeatureRow from "../features/feature/FeatureRow";
import { getAllFeatures } from "../services/apiRole";
import FeatureTableOperation from "../features/feature/FeatureTableOperation";

export default function FeatureManagment() {
  const [features, setFeatures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getFeatures = async () => {
      const reponse = await getAllFeatures("");
      setFeatures(reponse.data.data);
    };
    getFeatures();
  }, []);

  const handleAddFeature = (newFeature) => {
    setFeatures((prevFeature) => [...prevFeature, newFeature]);
  };

  const handleUpdateFeature = (updateFeature) => {
    setFeatures((prevFeature) =>
      prevFeature.map((feature) =>
        feature._id === updateFeature._id ? updateFeature : feature
      )
    );
  };
  const handleDeleteFeature = (featureId) => {
    setFeatures((prevFeature) =>
      prevFeature.filter((feature) => feature._id !== featureId)
    );
  };
  const filteredFeature = features.filter((feature) =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <Card>
      <FeatureTableOperation
        handleAddFeature={handleAddFeature}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <Table>
        <Table.Header>
          <Table.Head>Feature</Table.Head>
          <Table.Head>Created</Table.Head>
          <Table.Head>Actions</Table.Head>
        </Table.Header>
        <Table.Body
          data={filteredFeature}
          render={(feature) => (
            <FeatureRow
              handleDeleteFeature={handleDeleteFeature}
              handleupdateFeature={handleUpdateFeature}
              feature={feature}
              key={feature._id}
            />
          )}
        />
        <Table.Footer></Table.Footer>
      </Table>
    </Card>
  );
}
