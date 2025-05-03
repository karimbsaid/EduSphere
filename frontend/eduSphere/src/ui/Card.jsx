/* eslint-disable react/prop-types */
const Card = ({
  children,
  className = "",
  ...props
  // Accept a className prop
}) => {
  return (
    <div className={`rounded-2xl shadow-lg p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
