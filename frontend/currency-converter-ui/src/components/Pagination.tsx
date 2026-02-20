interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: Props) => {
  return (
    <div>
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};
