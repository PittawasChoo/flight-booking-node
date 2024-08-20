import moment from "moment";

export const combineDateTime = (date, time) => {
    const formattedDate = formatToDate(date);
    return moment(formattedDate + " " + time);
};

export const formatToDate = (dateTime) => {
    return moment(dateTime).format("YYYY-MM-DD");
};

export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return formatToDate(result);
};

export const getTimeDiff = (firstDateTime, secondDateTime) => {
    const duration = moment.duration(secondDateTime.diff(firstDateTime));
    const minutes = duration.asMinutes();
    return minutes;
};
