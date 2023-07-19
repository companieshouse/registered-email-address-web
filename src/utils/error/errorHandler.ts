const statementErrorsConst: string = "statementError";
const errorsConst: string = "errors";

export const requestFailed = ((data: object) => {
  return (
    Object.prototype.hasOwnProperty.call(data, errorsConst) ||
        Object.prototype.hasOwnProperty.call(data, statementErrorsConst)
  );
});
