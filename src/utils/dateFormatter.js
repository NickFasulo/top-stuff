export let dateFormatter = dateStr => {
  const date = new Date(dateStr);
  const dtf = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const [
    { value: month },
    ,
    { value: day },
    ,
    { value: year },
  ] = dtf.formatToParts(date);

  return month + ' ' + day + ' ' + year;
};
