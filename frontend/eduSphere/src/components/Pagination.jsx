/* eslint-disable react/prop-types */

import Button from "../ui/ButtonVF";

function Pagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  onPageChange,
}) {
  const hasResults = totalCount > 0;
  const hasMinimalPerPage = totalCount > perPage;
  const start = hasResults ? (currentPage - 1) * perPage + 1 : 0;
  const end = hasResults ? Math.min(currentPage * perPage, totalCount) : 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 px-4 py-3">
      <p className="text-sm text-slate-500">
        {hasResults && (
          <>
            affichage de <span>{start}</span> à <span>{end}</span> sur{" "}
            <span>{totalCount}</span>
          </>
        )}
      </p>

      {hasMinimalPerPage && (
        <div className="flex gap-6">
          <Button
            label="Précédent"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (page, i) => (
              <Button
                label={page}
                outline={currentPage === page ? false : true}
                variant="simple"
                key={i}
                onClick={() => onPageChange(page)}
              />
            )
          )}
          <Button
            label="Suivant"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </div>
      )}
    </div>
  );
}

export default Pagination;
