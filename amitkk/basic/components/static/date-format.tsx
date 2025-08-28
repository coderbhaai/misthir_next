import React from 'react';

type DateFormatProps = {
  date: string | Date;
};

const DateFormat: React.FC<DateFormatProps> = ({ date }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return <>{formattedDate}</>;
};

export default DateFormat;
