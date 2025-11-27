import React from 'react';

const Button = ({ children, onClick, type = "button", variant = "primary", isLoading = false }) => {
  // Varian warna tombol
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`w-full py-2 px-4 rounded-lg font-semibold transition duration-200 flex justify-center items-center ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <span className="animate-spin mr-2 h-5 w-5 border-2 border-b-transparent border-white rounded-full"></span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;