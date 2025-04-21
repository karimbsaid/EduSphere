/* eslint-disable react/prop-types */
const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl shadow-lg bg-white overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }) => {
  return <div className={`p-4 border-b ${className}`}>{children}</div>;
};

const CardContent = ({ children, className = "" }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

const CardFooter = ({ children, className = "" }) => {
  return <div className={`p-4 border-t ${className}`}>{children}</div>;
};

// Regrouper tous les sous-composants dans `Card`
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
