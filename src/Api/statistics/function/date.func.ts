export function StatisticsDateApiFunction(arr) {
  if (arr.length < 1) {
    return {
      min: {
        date: '',
        count: 0,
      },
      max: {
        date: '',
        count: 0,
      },
    };
  }

  let min = new Date();
  min.setFullYear(arr[0]._id.year);
  min.setMonth(arr[0]._id.month - 1);
  min.setDate(arr[0]._id.day);

  let max = new Date();
  let count = arr.length;
  console.log(count);
  count--;
  console.log(count);
  max.setFullYear(arr[count]._id.year);
  max.setMonth(arr[count]._id.month - 1);
  max.setDate(arr[count]._id.day);

  return {
    min: {
      date: min,
      count: arr[0].count,
    },
    max: {
      date: max,
      count: arr[count].count,
    },
  };
}
