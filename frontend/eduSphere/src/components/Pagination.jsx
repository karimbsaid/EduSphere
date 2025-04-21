/* eslint-disable react/prop-types */
import Button from "../ui/Button";

function Pagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  onPageChange,
}) {
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalCount);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 px-4 py-3">
      <p className="text-sm text-slate-500">
        affichage de <span>{start}</span> a <span>{end}</span> sur{" "}
        <span>{totalCount}</span>
      </p>
      <div className="flex gap-6">
        <Button
          label="Précédent"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page, i) => (
          <Button
            label={page}
            outline={true}
            className={`${
              currentPage === page
                ? " bg-black text-white"
                : "bg-white text-black "
            }`}
            key={i}
            onClick={() => onPageChange(page)}
          />
        ))}
        <Button
          label="Suivant"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </div>
    </div>
  );
}

export default Pagination;
