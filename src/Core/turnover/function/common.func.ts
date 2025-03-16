export const GetTerminalsTurnover = (last, terminals) => {
  if (last.terminals.length < 1) {
    return terminals;
  } else {
    return last.terminals;
  }
}

export const RemoveDuplicateTerminalsTurnOver = (terminals, data) => {

  if (data.length < 1) return terminals;

  let tmpArray = Array();

  for (const item of data) {
    const found = tmpArray.find(element => element == item);

    if (!found) tmpArray.push(item);
  }

  return tmpArray;
}