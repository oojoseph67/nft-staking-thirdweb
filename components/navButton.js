import React from "react";

// interface Props {
//     title: String;
//     isActive?: boolean
// }

function NavButton({ title, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${
        isActive && "bg-[#036756]"
      } text-white py-2 px-2 rounded font-bold`}
    >
      {title}
    </button>
  );
}

export default NavButton;
