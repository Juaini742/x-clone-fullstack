/* eslint-disable react/prop-types */
const LoadingSpinner = ({ size = "md" }) => {
  const sizeClass = `loading-${size}`;

  return <span className={`loading loading-spinner ${sizeClass}`} />;
};
export default LoadingSpinner;
