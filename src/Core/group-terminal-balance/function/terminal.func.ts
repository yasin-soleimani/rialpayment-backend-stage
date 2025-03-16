export const GroupTBTerminalResult = (data) => {
  let tmp = Array();

  for (const item of data) {
    tmp.push({
      _id: item._id,
      terminals: terminals(item.terminal),
    });
  }

  return tmp;
};

const terminals = (terminals) => {
  let tmp = Array();

  for (const item of terminals) {
    tmp.push({
      _id: item._id,
      title: item.title,
    });
  }

  return tmp;
};
