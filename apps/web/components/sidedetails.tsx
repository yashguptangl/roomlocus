import React from "react";

interface SideDetailProps {
  title: string;
  titleDetail: string;
  word: string;
}

const SideDetail = ({ title, titleDetail, word }: SideDetailProps) => {
  return (
    <div className="mt-5 text-end mr-4 mod:mr-7 ml:mr-12">
      <p className="text-2xl sm:text-3xl md:text-4xl font-normal ">
        {title}
      </p>
      <p className="text-xl sm:text-2xl md:text-3xl text-blue-300  ">
        {titleDetail}
      </p>
      <p className="text-lg sm:text-xl md:text-2xl text-gray-600  ">
        {word}
      </p>
    </div>
  );
};

export { SideDetail };
