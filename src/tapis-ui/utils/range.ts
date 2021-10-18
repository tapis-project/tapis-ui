export const range = (size: number, startAt: number = 0): Array<number> => {
  let rangeArr: Array<number> = [];
  for (let i = 0; i < size; i++) {
    rangeArr.push(i + startAt);
  }
  return rangeArr;
};
